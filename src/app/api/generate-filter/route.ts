import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, filterPrompt, style } = body;

    if (!filterPrompt) {
      return NextResponse.json(
        { error: 'Missing required field: filterPrompt' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Use image generation to create a filtered-style image based on the prompt
    // Since the SDK generates from text prompts, we create an artistic rendition
    const enhancedPrompt = `${filterPrompt}, portrait photo style, high quality, detailed, vibrant colors`;

    const result = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: '1024x1024',
    });

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    const filteredImage = result.data[0].base64;

    return NextResponse.json({
      filteredImage: `data:image/png;base64,${filteredImage}`,
      style,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error('AI filter generation error:', error);
    return NextResponse.json(
      { error: 'Filter generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
