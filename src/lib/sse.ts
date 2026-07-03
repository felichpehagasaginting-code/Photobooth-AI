type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

class SSEManager {
  private clients = new Map<string, SSEClient>();

  register(
    session: string,
    id: string,
    controller: ReadableStreamDefaultController
  ): void {
    this.clients.set(`${session}:${id}`, { id, controller });
  }

  unregister(
    session: string,
    id: string
  ): void {
    const key = `${session}:${id}`;
    const client = this.clients.get(key);
    if (client) {
      try {
        client.controller.close();
      } catch {
        // already closed
      }
      this.clients.delete(key);
    }
  }

  broadcast(event: string, data: unknown = {}): void {
    const message = `data: ${JSON.stringify({ event, ...(data as object) })}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    const deadKeys: string[] = [];
    for (const [key, client] of this.clients) {
      try {
        client.controller.enqueue(encoded);
      } catch {
        deadKeys.push(key);
      }
    }
    for (const key of deadKeys) {
      this.clients.delete(key);
    }
  }

  getActiveConnectionsCount(): number {
    return this.clients.size;
  }
}

const globalForSSE = globalThis as unknown as { sseManager?: SSEManager };
export const sseManager = globalForSSE.sseManager ?? new SSEManager();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseManager = sseManager;
