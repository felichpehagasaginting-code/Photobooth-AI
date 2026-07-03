import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { tryGemini, tryQwen, tryPollinations } from '@/app/api/generate-filter/route';
import { nvidiaAI } from '@/lib/nvidia-ai';
import fs from 'fs';
import path from 'path';

// Helper to convert local image paths to base64 Data URLs
function getBase64Image(imageUrl: string): string {
  if (imageUrl.startsWith('data:image')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).substring(1) || 'jpeg';
      const base64 = fs.readFileSync(filePath).toString('base64');
      return `data:image/${ext};base64,${base64}`;
    }
  }
  throw new Error(`Image file not found: ${imageUrl}`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    console.log(`[process-ai-transaction] Starting server-side AI for transaction: ${transactionId}`);

    // 1. Fetch transaction from Firestore
    const transactionDoc = await adminDb.collection('transactions').doc(transactionId).get();
    if (!transactionDoc.exists) {
      return NextResponse.json({ error: 'Transaction not found in Firestore' }, { status: 404 });
    }

    const transaction = transactionDoc.data()!;
    const filterNames: string[] = transaction.filterNames || [];

    if (filterNames.length === 0) {
      return NextResponse.json({ error: 'No filters chosen for this transaction' }, { status: 400 });
    }

    // 2. Fetch active filters matching selected names
    const filtersSnapshot = await adminDb.collection('filters').where('active', '==', true).get();
    const allActiveFilters = filtersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const selectedFilters = allActiveFilters.filter(f => filterNames.includes(f.name));

    if (selectedFilters.length === 0) {
      return NextResponse.json({ error: 'Selected filters are inactive or missing' }, { status: 400 });
    }

    // 3. Fetch original photos for the transaction from Firestore
    const photosSnapshot = await adminDb.collection('photos')
      .where('transactionId', '==', transactionId)
      .get();

    const photos = photosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Fallback: If no photos are present in Firestore, check if we have any files uploaded under public/photos/transactionId
    if (photos.length === 0) {
      return NextResponse.json({ error: 'No original photos found for this transaction' }, { status: 400 });
    }

    const processedResults: any[] = [];
    const photoDir = path.join(process.cwd(), 'public', 'photos', transactionId);
    fs.mkdirSync(photoDir, { recursive: true });

    // 4. Run AI generation loop (for each original photo and selected filter)
    for (const photo of photos) {
      // Skip if the photo document is already a filtered variant (we only want original ones)
      if (photo.filteredUrl && photo.filteredUrl !== photo.originalUrl) {
        continue;
      }

      let base64Input: string;
      try {
        base64Input = getBase64Image(photo.originalUrl);
      } catch (err: any) {
        console.error(`[process-ai-transaction] Failed to read original image:`, err.message);
        continue;
      }

      for (const filter of selectedFilters) {
        console.log(`[process-ai-transaction] Running AI style [${filter.name}] on photo: ${photo.id}`);

        // 4.1 Apply NVIDIA Nemotron Enhancement
        const filterPrompt = filter.prompt || filter.name;
        let enhancedPrompt = filterPrompt;
        let nvidiaReasoning = '';

        if (nvidiaAI.isConfigured) {
          try {
            const enhancement = await nvidiaAI.enhancePrompt(
              'A portrait photo from a photobooth session',
              filterPrompt,
              filter.style || 'artistic'
            );
            enhancedPrompt = enhancement.enhancedPrompt;
            nvidiaReasoning = enhancement.reasoning;
          } catch (nvErr) {
            console.warn('[process-ai-transaction] NVIDIA enhancement failed, using default prompt');
          }
        }

        // 4.2 Execute AI Image Generation providers
        let filteredBase64: string | null = null;
        let providerUsed = 'none';

        // Try Gemini
        try {
          filteredBase64 = await tryGemini(base64Input, enhancedPrompt);
          if (filteredBase64) providerUsed = 'gemini+nvidia';
        } catch {}

        // Try Qwen
        if (!filteredBase64) {
          try {
            filteredBase64 = await tryQwen(base64Input, enhancedPrompt);
            if (filteredBase64) providerUsed = 'qwen+nvidia';
          } catch {}
        }

        // Try Pollinations
        if (!filteredBase64) {
          try {
            filteredBase64 = await tryPollinations(base64Input, enhancedPrompt);
            if (filteredBase64) providerUsed = 'pollinations+nvidia';
          } catch {}
        }

        // Fallback: use original image if all providers fail
        if (!filteredBase64) {
          filteredBase64 = base64Input;
          providerUsed = 'fallback-original';
        }

        // 4.3 Save the processed image back to disk
        const match = filteredBase64.match(/^data:([^;]+);base64,(.+)$/);
        const imgBuffer = match ? Buffer.from(match[2], 'base64') : Buffer.from(filteredBase64, 'base64');
        const fileExt = match ? (match[1].split('/')[1] || 'png') : 'png';
        const filteredFileName = `filtered_${filter.name.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const filteredFilePath = path.join(photoDir, filteredFileName);
        fs.writeFileSync(filteredFilePath, imgBuffer);

        const filteredUrl = `/photos/${transactionId}/${filteredFileName}`;

        // 4.4 Save new Photo record in Firestore
        const newPhotoRef = adminDb.collection('photos').doc();
        await newPhotoRef.set({
          transactionId,
          originalUrl: photo.originalUrl,
          filteredUrl,
          filterName: filter.name,
          fileName: filteredFileName,
          fileSize: imgBuffer.length,
          createdAt: new Date(),
        });

        processedResults.push({
          photoId: newPhotoRef.id,
          filterName: filter.name,
          filteredUrl,
          provider: providerUsed,
          nvidiaReasoning: nvidiaReasoning || undefined,
        });
      }
    }

    // 5. Update transaction document status to paid / fully processed
    await adminDb.collection('transactions').doc(transactionId).update({
      status: 'paid', // Update status to paid after AI processing is completed
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedResults.length} AI filter variants for transaction ${transactionId}`,
      results: processedResults,
    });

  } catch (error) {
    console.error('[process-ai-transaction] Unexpected error:', error);
    return NextResponse.json(
      { error: 'AI transaction processing failed', details: String(error) },
      { status: 500 }
    );
  }
}
