import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PB-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, amount } = body;

    if (!packageId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: packageId, amount' },
        { status: 400 }
      );
    }

    // Verify package exists
    const pkg = await db.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const orderId = generateOrderId();

    const transaction = await db.transaction.create({
      data: {
        orderId,
        packageId,
        amount,
        status: 'pending',
        paymentMethod: 'qris',
      },
      include: {
        package: true,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
