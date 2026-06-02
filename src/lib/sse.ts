type Client = { id: string; controller: ReadableStreamDefaultController };

class SSEManager {
  private clients: Client[] = [];

  register(id: string, controller: ReadableStreamDefaultController) {
    this.clients.push({ id, controller });
  }

  unregister(id: string) {
    this.clients = this.clients.filter(c => c.id !== id);
  }

  broadcast(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    this.clients.forEach(c => {
      try {
        c.controller.enqueue(encoded);
      } catch {
        // Handle closed connections automatically
      }
    });
  }
}

// Global declaration to preserve singleton across Hot-Reload in Next.js development
const globalForSSE = global as unknown as { sseManager?: SSEManager };
export const sseManager = globalForSSE.sseManager ?? new SSEManager();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseManager = sseManager;
