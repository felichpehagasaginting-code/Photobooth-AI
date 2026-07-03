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

export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImage> {
  const {
    quality = 85,
    format = "auto",
    maxWidth,
    maxHeight,
    fit = "cover",
  } = options;

  const originalSize = buffer.length;
  const basePipeline = sharp(buffer).rotate();

  if (maxWidth || maxHeight) {
    basePipeline.resize(maxWidth, maxHeight, {
      fit,
      withoutEnlargement: true,
    });
  }

  let processedBuffer: Buffer;
  const resolvedFormat = format === "auto"
    ? "webp"
    : format;

  switch (resolvedFormat) {
    case "webp":
      processedBuffer = await basePipeline
        .webp({ quality: Math.min(quality, 100), effort: 4 })
        .toBuffer();
      break;
    case "jpeg":
      processedBuffer = await basePipeline
        .jpeg({ quality: Math.min(quality, 100), progressive: true, chromaSubsampling: "4:2:0" })
        .toBuffer();
      break;
    case "png":
      processedBuffer = await basePipeline.png().toBuffer();
      break;
    default:
      processedBuffer = await basePipeline
        .webp({ quality: Math.min(quality, 100), effort: 4 })
        .toBuffer();
  }

  const metadata = await sharp(processedBuffer).metadata();
  const optimizedSize = processedBuffer.length;
  const compressionRatio = originalSize > 0
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 10000) / 100
    : 0;

  return {
    buffer: processedBuffer,
    metadata: metadata || {},
    originalSize,
    optimizedSize,
    compressionRatio,
  };
}

export async function processImageBatch(
  buffers: Buffer[],
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImage[]> {
  const concurrency = 3;
  const results: ProcessedImage[] = [];

  for (let i = 0; i < buffers.length; i += concurrency) {
    const batch = buffers.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((buf) => optimizeImage(buf, options))
    );
    results.push(...batchResults);
  }

  return results;
}

export type CompressionProfile = { preset: string; quality: number; format?: string };

export function getCompressionPreset(
  _imageUrl: string,
  useCase: "social" | "web" | "archive" | "print"
): CompressionProfile {
  const profiles: Record<string, CompressionProfile> = {
    social: { preset: "webp", quality: 80 },
    web: { preset: "webp", quality: 85 },
    archive: { preset: "jpeg", quality: 95 },
    print: { preset: "png", quality: 100 },
  };
  return profiles[useCase] || profiles.web;
}

export async function createProgressiveJpeg(
  buffer: Buffer,
  maxWidth?: number | null,
  maxHeight?: number | null
): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
  const pipeline = sharp(buffer).rotate();

  if (maxWidth || maxHeight) {
    pipeline.resize(maxWidth, maxHeight, {
      fit: "cover",
      withoutEnlargement: true,
    });
  }

  const resultBuffer = await pipeline
    .jpeg({
      quality: 85,
      progressive: true,
      chromaSubsampling: "4:2:0",
    })
    .toBuffer();

  const metadata = await sharp(resultBuffer).metadata();

  return { buffer: resultBuffer, metadata };
}
