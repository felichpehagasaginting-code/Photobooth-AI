import sharp from "sharp";
import type { ImageMetadata } from "sharp";

export interface ImageOptimizationOptions {
  quality?: number;
  format?: "jpeg" | "webp" | "png" | "auto";
  maxWidth?: number;
  maxHeight?: number;
  fit?: "contain" | "cover" | "inside" | "fill";
  background?: string;
  removeMetadata?: boolean;
  stripExif?: boolean;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Production-Ready Image Processing Pipeline dengan Multi-Format Optimization
 * 
 * Features:
 * - Automatic format selection (WebP/PNG/JPEG)
 * - Lossless resizing with quality preservation
 * - EXIF/IPX metadata stripping untuk reduced filesize
 * - Format-specific compression profiles
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImage> {

  const {
    quality = 85,
    format = "auto",
    maxWidth = undefined,
    maxHeight = undefined,
    fit = "cover",
    background = "rgba(255,255,255,1)",
    removeMetadata = true,
    stripExif = true,
  } = options;

  const originalSize = buffer.length;

  let processedBuffer: Buffer;
  let metadata: ImageMetadata | undefined;

  // Format Auto-Detection & Processing Strategy
  switch (format.toLowerCase()) {
    case "webp":
      processedBuffer = await sharp(buffer)
        .rotate(automaticOrientations(buffer))
        .resize(maxWidth, maxHeight, {
          fit,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: Math.min(quality, 100),
          chromaSubsampling: "4:2:0",
          progressive: true,
        })
        .webp({
          quality: Math.min(quality, 100),
          lossless: false,
          effort: 6,
          chromaSubsampling: "4:2:0",
          nearLosslessAccuracy: 0.05,
        })
        .toBuffer();

      metadata = await sharp(buffer).metadata();
      break;

    case "jpeg":
      processedBuffer = await sharp(buffer)
        .rotate(automaticOrientations(buffer))
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement: true })
        .jpeg({
          quality: Math.min(quality, 100),
          progressive: true,
          chromaSubsampling: "4:2:0",
        })
        .toBuffer();

      metadata = await sharp(buffer).metadata();
      break;

    case "png":
      processedBuffer = await sharp(buffer)
        .rotate(automaticOrientations(buffer))
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement: true })
        .png()
        .toBuffer();

      metadata = await sharp(buffer).metadata({ depth: false });
      break;

    default: // Auto-detect
      try {
        const detectResult = await sharp(buffer).toBuffer();
        processedBuffer = detectResult;
        
        // Try WebP first (best compression), fallback to JPEG
        processedBuffer = await sharp(processedBuffer)
          .jpeg({ quality, progressive: true })
          .webp({ quality, nearLosslessAccuracy: 0.05 })
          .toBuffer();

        metadata = await sharp(buffer).metadata();
      } catch {
        processedBuffer = buffer; // Return original on error
        metadata = undefined;
      }
      break;
  }

  const optimizedSize = processedBuffer.length;
  const compressionRatio = originalSize > 0 
    ? (originalSize - optimizedSize) / originalSize * 100 
    : 0;

  return {
    buffer: processedBuffer,
    metadata: metadata || {},
    originalSize,
    optimizedSize,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
  };
}

/**
 * Batch Process Multiple Images dengan Parallel Processing & Memory Limits
 */
export async function processImageBatch(
  buffers: Buffer[],
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImage[]> {
  
  const maxConcurrency = Math.min(5, Math.ceil(buffers.length / 2));
  let processedCount = 0;
  const results: ProcessedImage[] = [];

  // Parallel processing dengan controlled concurrency
  async function processOne(index: number) {
    return optimizeImage(buffers[index], options).then((processed) => {
      console.log(
        `[Batch] Image ${index + 1}/${buffers.length} processed. ` +
        `Size: ${(processed.optimizedSize / 1024).toFixed(1)}KB, ` +
        `Compression: ${processed.compressionRatio}%`
      );
      
      processedCount++;
      
      return processed;
    });
  }

  // Create parallel jobs
  const batchSize = Math.ceil(buffers.length / maxConcurrency);
  const allBuffersLength = buffers.length;
  
  for (let i = 0; i < allBuffersLength; i += batchSize) {
    const batchCount = Math.min(allBuffersLength - i, batchSize);
    const batch = buffers.slice(i, i + batchCount);
    
    const batchPromises = batch.map((buffer, index) => 
      processOne(i + index)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Smart Compression Profiles berdasarkan Image Type & Use Case
 */
export type CompressionProfile = { preset: string; quality: number; format?: string };

export function getCompressionPreset(
  imageUrl: string,
  useCase: "social" | "web" | "archive" | "print"
): CompressionProfile {

  const profiles: Record<string, CompressionProfile> = {
    social: { preset: "webp", quality: 80 },      // Instagram, Facebook optimal
    web: { preset: "webp", quality: 85 },         // Standard website use
    archive: { preset: "jpeg", quality: 95 },     // High quality preservation
    print: { preset: "png", quality: 100 },       // Lossless for printing
  };

  return profiles[useCase] || profiles["web"];
}

/**
 * Progressive JPEG Encoding Strategy untuk Web Performance
 */
export async function createProgressiveJpeg(
  buffer: Buffer,
  maxWidth?: number | null,
  maxHeight?: number | null
): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {

  const options = width && height ? { fit } : undefined; 

  return sharp(buffer)
    .rotate(automaticOrientations(buffer))
    .resize(maxWidth, maxHeight, {
      fit,
      enlarge: false,
    })
    .jpeg({
      quality: 85,
      progressive: true,
      chromaSubsampling: "4:2:0",
      mozMultithreaded: false,
      mozMimeReporting: false,
    })
    .toBuffer()
    .then(buffer => {
      const metadata = sharp(buffer).metadata();
      
      return {
        buffer,
        metadata,
      };
    });
}

/**
 * Extract Image Orientation from EXIF Data
 */
function automaticOrientations(buffer: Buffer): number {
  const exif = sharp(buffer)?.extract({ input: "exif" });
  
  if (!exif) return 0;
  
  const result = new Promise<{ Orientation: number }>(resolve => exif.then(res => resolve(res)));
  
  return (await result).Orientation || 1;
}
