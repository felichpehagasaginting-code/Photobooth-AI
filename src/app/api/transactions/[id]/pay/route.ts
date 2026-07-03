import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sseManager } from '@/lib/sse';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await db.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status === 'paid') {
      return NextResponse.json(
        { error: 'Transaction already paid' },
        { status: 400 }
      );
    }

    const downloadToken = randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const updated = await db.transaction.update({
      where: { id },
      data: {
        status: 'paid',
        paymentTime: new Date(),
        paymentMethod: 'qris',
        downloadToken,
        tokenExpiresAt,
      },
      include: {
        package: true,
      },
    });

    sseManager.broadcast('transaction_paid', { transactionId: id });
    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
