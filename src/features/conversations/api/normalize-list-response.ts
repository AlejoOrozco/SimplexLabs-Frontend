/** Unwraps API list payloads that may be a bare array or `{ items }` pagination envelope. */
export function unwrapListItems<T>(data: T[] | { items: T[] }): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
    return data.items;
  }
  return [];
}
