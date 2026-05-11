import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const packages = await db.package.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Admin get packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, filterCount, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.package.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (filterCount !== undefined) updateData.filterCount = filterCount;
    if (active !== undefined) updateData.active = active;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updated = await db.package.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ package: updated });
  } catch (error) {
    console.error('Admin update package error:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}
