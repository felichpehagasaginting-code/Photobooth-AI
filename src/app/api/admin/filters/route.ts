import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filters = await db.filter.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error('Admin get filters error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, category, style, prompt, active, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.filter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Filter not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (style !== undefined) updateData.style = style;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (active !== undefined) updateData.active = active;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updated = await db.filter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ filter: updated });
  } catch (error) {
    console.error('Admin update filter error:', error);
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    );
  }
}
