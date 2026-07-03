import { NextResponse } from 'next/server';
import { nvidiaAI } from '@/lib/nvidia-ai';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    if (!nvidiaAI.isConfigured) {
      return NextResponse.json(
        { error: 'NVIDIA API key not configured. Add NVIDIA_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { photos } = body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: photos (array of base64 data URLs)' },
        { status: 400 }
      );
    }

    // Get available filters from DB
    let availableFilters: Array<{ name: string; description: string; style: string }> = [];
    try {
      const dbFilters = await db.filter.findMany({ where: { active: true } });
      availableFilters = dbFilters.map(f => ({
        name: f.name,
        description: f.description || '',
        style: f.style,
      }));
    } catch {
      // Fallback to defaults if DB unavailable
      const { DEFAULT_FILTERS } = await import('@/types');
      availableFilters = DEFAULT_FILTERS.map(f => ({
        name: f.name,
        description: f.description || '',
        style: f.style,
      }));
    }

    if (availableFilters.length === 0) {
      return NextResponse.json(
        { error: 'No filters available to suggest from' },
        { status: 400 }
      );
    }

    const result = await nvidiaAI.suggestFilters(photos, availableFilters);

    return NextResponse.json({
      suggestions: result.suggestions,
      reasoning: result.reasoning,
      availableFilters: availableFilters.length,
    });
  } catch (error) {
    console.error('[NVIDIA Filter Advisor] Error:', error);
    return NextResponse.json(
      { error: 'Filter suggestion failed', details: String(error) },
      { status: 500 }
    );
  }
}
