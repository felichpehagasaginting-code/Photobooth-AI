import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sseManager } from '@/lib/sse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const transactionId = formData.get('transactionId') as string;
    const original = formData.get('original') as File | null;
    const filtered = formData.get('filtered') as File | null;
    const filterName = formData.get('filterName') as string;

    if (!transactionId || !original || !filtered || !filterName) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, original, filtered, filterName' },
        { status: 400 }
      );
    }

    // Verify transaction exists
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Create directory for photos
    const photoDir = path.join(process.cwd(), 'public', 'photos', transactionId);
    fs.mkdirSync(photoDir, { recursive: true });

    // Save original photo
    const originalBytes = await original.arrayBuffer();
    const originalExt = original.name.split('.').pop() || 'jpg';
    const originalFileName = `original_${Date.now()}.${originalExt}`;
    const originalPath = path.join(photoDir, originalFileName);
    fs.writeFileSync(originalPath, Buffer.from(originalBytes));

    // Save filtered photo
    const filteredBytes = await filtered.arrayBuffer();
    const filteredExt = filtered.name.split('.').pop() || 'jpg';
    const filteredFileName = `filtered_${filterName}_${Date.now()}.${filteredExt}`;
    const filteredPath = path.join(photoDir, filteredFileName);
    fs.writeFileSync(filteredPath, Buffer.from(filteredBytes));

    // Create photo record in database
    const photo = await db.photo.create({
      data: {
        transactionId,
        originalUrl: `/photos/${transactionId}/${originalFileName}`,
        filteredUrl: `/photos/${transactionId}/${filteredFileName}`,
        filterName,
        fileName: original.name,
        fileSize: original.size,
      },
    });

    // Update transaction filterNames
    const currentFilterNames = transaction.filterNames
      ? transaction.filterNames.split(',')
      : [];
    if (!currentFilterNames.includes(filterName)) {
      currentFilterNames.push(filterName);
      await db.transaction.update({
        where: { id: transactionId },
        data: { filterNames: currentFilterNames.join(',') },
      });
    }

    sseManager.broadcast('photo_uploaded', { transactionId });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
