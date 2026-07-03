import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { transactionId, email } = await request.json();
    
    if (!transactionId || !email) {
      return NextResponse.json({ error: 'Missing transactionId or email' }, { status: 400 });
    }

    // 1. Fetch transaction and associated photo
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { photos: true },
    });

    if (!transaction || transaction.photos.length === 0) {
      return NextResponse.json({ error: 'Transaction or photos not found' }, { status: 404 });
    }

    const photo = transaction.photos[0];
    if (!photo.filteredUrl) {
      return NextResponse.json({ error: 'Photo URL is missing' }, { status: 404 });
    }
    const absolutePhotoPath = path.join(process.cwd(), 'public', photo.filteredUrl);

    // Verify local file exists
    if (!fs.existsSync(absolutePhotoPath)) {
      return NextResponse.json({ error: 'Photo file not found on disk' }, { status: 404 });
    }

    // Check if Google Service Account credentials are provided in env
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (credentialsJson) {
      try {
        const googleapis = await import('googleapis');
        const google = googleapis.google || googleapis.default?.google;
        
        const credentials = JSON.parse(credentialsJson);
        const auth = new google.auth.JWT(
          credentials.client_email,
          null,
          credentials.private_key,
          ['https://www.googleapis.com/auth/drive']
        );

        const drive = google.drive({ version: 'v3', auth });

        // Metadata for the file upload
        const fileMetadata = {
          name: `aibooth-${transaction.orderId}.jpg`,
          parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
        };

        const media = {
          mimeType: 'image/jpeg',
          body: fs.createReadStream(absolutePhotoPath),
        };

        // Create the file in Google Drive
        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });

        const fileId = file.data.id;

        if (!fileId) {
          throw new Error('Failed to retrieve file ID from Google Drive response');
        }

        // Grant viewer/reader permissions to the user's email
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'user',
            emailAddress: email,
          },
          sendNotificationEmail: true, // Auto notify user via email with Drive link
        });

        return NextResponse.json({ 
          success: true, 
          simulated: false,
          link: file.data.webViewLink 
        });
      } catch (err: any) {
        console.error('Real Google Drive upload failed, falling back to simulation:', err);
      }
    }

    // Simulation Fallback
    // Wait for 1.5 seconds to simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      success: true, 
      simulated: true, 
      link: `https://drive.google.com/drive/my-drive`
    });

  } catch (error) {
    console.error('Google Drive share route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
