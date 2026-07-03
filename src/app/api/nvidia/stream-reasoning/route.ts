import { NextResponse } from 'next/server';
import { nvidiaAI } from '@/lib/nvidia-ai';

export async function POST(request: Request) {
  try {
    if (!nvidiaAI.isConfigured) {
      return NextResponse.json(
        { error: 'NVIDIA API key not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prompt, maxTokens = 4096 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of nvidiaAI.streamReasoning(prompt)) {
            const payload = JSON.stringify({
              type: chunk.token ? 'token' : chunk.reasoning ? 'reasoning' : 'done',
              content: chunk.token || chunk.reasoning || '',
              done: chunk.done,
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

            if (chunk.done) {
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            }
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: String(err), done: true })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[NVIDIA Stream] Error:', error);
    return NextResponse.json(
      { error: 'Stream failed', details: String(error) },
      { status: 500 }
    );
  }
}
