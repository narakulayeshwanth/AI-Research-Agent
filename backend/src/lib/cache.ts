/**
 * Simple in-memory TTL cache to replace Next.js unstable_cache on the Express backend.
 * Entries expire after `ttlSeconds` and are evicted lazily on next access.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function withCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyPrefix: string,
  ttlSeconds: number
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    const now = Date.now();
    const cached = store.get(key) as CacheEntry<TReturn> | undefined;

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const result = await fn(...args);
    store.set(key, { value: result, expiresAt: now + ttlSeconds * 1000 });
    return result;
  };
}
