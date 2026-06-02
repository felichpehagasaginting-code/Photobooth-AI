import { NextRequest } from 'next/server';
import { sseManager } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = Math.random().toString(36).substring(2);

  const stream = new ReadableStream({
    start(controller) {
      sseManager.register(clientId, controller);
      
      // Send initial heartbeat connection confirmation
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(': heartbeat\n\n'));
    },
    cancel() {
      sseManager.unregister(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
