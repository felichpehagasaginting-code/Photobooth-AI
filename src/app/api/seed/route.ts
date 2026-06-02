import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Seed default admin
    const existingAdmin = await db.admin.findFirst({ where: { username: 'admin' } });
    if (!existingAdmin) {
      await db.admin.create({
        data: {
          username: 'admin',
          passwordHash: 'admin123',
          pin: '123456',
        },
      });
    }

    // Seed default packages
    const existingPackages = await db.package.count();
    if (existingPackages === 0) {
      await db.package.createMany({
        data: [
          {
            name: 'Basic',
            description: '1 AI filter of your choice',
            price: 0,
            filterCount: 1,
            active: true,
            sortOrder: 1,
          },
          {
            name: 'Standard',
            description: '3 AI filters of your choice',
            price: 0,
            filterCount: 3,
            active: true,
            sortOrder: 2,
          },
          {
            name: 'Premium',
            description: 'All Access - Use all AI filters',
            price: 0,
            filterCount: 99,
            active: true,
            sortOrder: 3,
          },
        ],
      });
    }

    // Seed default filters
    const existingFilters = await db.filter.count();
    if (existingFilters === 0) {
      await db.filter.createMany({
        data: [
          {
            name: 'Anime Ghibli',
            description: 'Transform into Studio Ghibli anime art style',
            category: 'artistic',
            style: 'anime',
            thumbnail: '/filters/anime-ghibli.png',
            prompt: 'Convert this photo into Studio Ghibli anime art style, soft watercolor-like coloring, dreamy atmosphere, detailed backgrounds, warm lighting, Miyazaki style',
            active: true,
            sortOrder: 1,
          },
          {
            name: 'Anime Shonen',
            description: 'Bold Shonen anime art style',
            category: 'artistic',
            style: 'anime',
            prompt: 'Convert this photo into Shonen anime art style, bold outlines, vibrant colors, dynamic action manga style, dramatic lighting, sharp edges',
            active: true,
            sortOrder: 2,
          },
          {
            name: 'Watercolor',
            description: 'Beautiful watercolor painting style',
            category: 'artistic',
            style: 'watercolor',
            thumbnail: '/filters/watercolor.png',
            prompt: 'Convert this photo into a beautiful watercolor painting, soft blended colors, paper texture visible, artistic brush strokes, gentle color bleeding',
            active: true,
            sortOrder: 3,
          },
          {
            name: 'Cyberpunk Neon',
            description: 'Futuristic cyberpunk neon art',
            category: 'artistic',
            style: 'cyberpunk',
            thumbnail: '/filters/cyberpunk.png',
            prompt: 'Convert this photo into cyberpunk neon art style, glowing neon lights, dark futuristic atmosphere, holographic effects, purple and cyan color scheme, rain',
            active: true,
            sortOrder: 4,
          },
          {
            name: 'Vintage Film',
            description: 'Retro vintage film photography',
            category: 'artistic',
            style: 'vintage',
            prompt: 'Convert this photo into vintage film photography style, film grain, warm color shift, light leaks, slightly faded, retro 1970s aesthetic, analog camera look',
            active: true,
            sortOrder: 5,
          },
          {
            name: 'AI Beauty',
            description: 'AI-enhanced beauty portrait',
            category: 'beauty',
            style: 'beauty',
            prompt: 'Apply beauty enhancement to this photo, smooth skin, enhance features naturally, professional portrait lighting, soft focus background, magazine cover quality',
            active: true,
            sortOrder: 6,
          },
          {
            name: 'Fantasy Background',
            description: 'Magical fantasy landscape background',
            category: 'background',
            style: 'virtual_bg',
            prompt: 'Replace the background with a magical fantasy landscape, enchanted forest with glowing particles, mystical atmosphere, keep the person unchanged, dreamy lighting',
            active: true,
            sortOrder: 7,
          },
          {
            name: 'Comic Book',
            description: 'Comic book pop art style',
            category: 'morphing',
            style: 'comic',
            thumbnail: '/filters/comic.png',
            prompt: 'Convert this photo into comic book pop art style, halftone dots, bold black outlines, bright saturated colors, action comic panel look, Ben-Day dots effect',
            active: true,
            sortOrder: 8,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      admin: !existingAdmin ? 'created' : 'already_exists',
      packages: existingPackages === 0 ? 'created' : 'already_exists',
      filters: existingFilters === 0 ? 'created' : 'already_exists',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
