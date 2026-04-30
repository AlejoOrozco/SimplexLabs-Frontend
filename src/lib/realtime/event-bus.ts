type EventMap = {
  'session:expired': { reason: string };
  'auth:forbidden': undefined;
  'socket:connected': undefined;
  'socket:disconnected': undefined;
  'socket:reconnected': undefined;
};

type EventKey = keyof EventMap;
type Listener<K extends EventKey> = (payload: EventMap[K]) => void;

class EventBus {
  private listeners = new Map<EventKey, Set<Listener<EventKey>>>();

  public on<K extends EventKey>(event: K, listener: Listener<K>): () => void {
    const list = this.listeners.get(event) ?? new Set<Listener<EventKey>>();
    list.add(listener as Listener<EventKey>);
    this.listeners.set(event, list);
    return () => {
      list.delete(listener as Listener<EventKey>);
    };
  }

  public emit<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const listener of list) {
      listener(payload);
    }
  }
}

export const eventBus = new EventBus();
