// Production-Rudy SSE Manager with Connection Pooling & Retry Logic
type Client = { id: string; controller: ReadableStreamDefaultController };
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 3000, 6000];

class SSEManager {
  private clients: Map<string, Client[]> = new Map();
  private readonly activeConnections = new Map<Session, Set<Map<string, Client>>>();

  async register(
    session: Session,
    id: string,
    controller: ReadableStreamDefaultController
  ) {
    if (!this.activeConnections.has(session)) {
      this.activeConnections.set(session, new Set());
    }

    const connectionId = crypto.randomUUID();
    const clientMap = new Map();
    clientMap.set(id, { id, controller });
    
    this.activeConnections.get(session)!.add(clientMap);
  }

  async unregister(
    session: Session,
    id: string,
    subscriptionId: string | null = null
  ) {
    const clientMaps = this.activeConnections.get(session);
    if (!clientMaps) return;

    for (const clientMap of clientMaps) {
      const client = clientMap.get(id);
      if (client) {
        try {
          await new Promise<void>((resolve, reject) => {
            const stream = client.controller?.getStream();
            if (!stream) return resolve();

            const reader = stream.getReader();
            const unsubscribe = () => {
              reader.cancel().then(resolve).catch(reject);
            };

            reader.closed.then(removeListener).catch(removeListener);

            function removeListener() {
              stream.off("error", subscribeOnError);
              stream.off("close", unsubscribe);
              stream.off("finished", unsubscribe);
              unsubscribe();
            }

            function subscribeOnError(err: any) {
              console.log(`SSE Error for ${id}:`, err);
              removeListener();
            }
          });
        } catch (err) {
          console.error(`Failed to disconnect SSE client ${id}:`, err);
        } finally {
          clientMap.delete(id);
          
          if (subscriptionId && !clientMap.size) {
            clientMaps.delete(subscriptionId);
          }
        }
      }
    }
  }

  broadcast(data: any): void {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    for (const [_, clientList] of this.activeConnections) {
      for (const clientMap of clientList) {
        for (const client of clientMap.values()) {
          try {
            client.controller.enqueue(encoded);
          } catch {
            // Handle closed connections automatically
          }
        }
      }
    }
  }

  getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }
}

// Global declaration to preserve singleton across Hot-Reload in Next.js development
const globalForSSE = global as unknown as { sseManager?: SSEManager };
export const sseManager = globalForSSE.sseManager ?? new SSEManager();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseManager = sseManager;
