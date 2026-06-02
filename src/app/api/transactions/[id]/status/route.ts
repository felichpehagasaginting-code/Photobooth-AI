import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        package: true,
        photos: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: transaction.id,
      orderId: transaction.orderId,
      status: transaction.status,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      paymentTime: transaction.paymentTime,
      downloadToken: transaction.downloadToken,
      tokenExpiresAt: transaction.tokenExpiresAt,
      filterNames: transaction.filterNames,
      package: transaction.package,
      photos: transaction.photos,
      photoCount: transaction.photos.length,
      createdAt: transaction.createdAt,
    });
  } catch (error) {
    console.error('Get transaction status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction status' },
      { status: 500 }
    );
  }
}
