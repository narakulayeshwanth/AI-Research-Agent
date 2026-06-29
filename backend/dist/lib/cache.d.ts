/**
 * Simple in-memory TTL cache to replace Next.js unstable_cache on the Express backend.
 * Entries expire after `ttlSeconds` and are evicted lazily on next access.
 */
export declare function withCache<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, keyPrefix: string, ttlSeconds: number): (...args: TArgs) => Promise<TReturn>;
//# sourceMappingURL=cache.d.ts.map