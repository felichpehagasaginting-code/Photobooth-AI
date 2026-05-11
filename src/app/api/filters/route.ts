import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: { active: boolean; category?: string } = { active: true };
    if (category) {
      where.category = category;
    }

    const filters = await db.filter.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error('Get filters error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}
