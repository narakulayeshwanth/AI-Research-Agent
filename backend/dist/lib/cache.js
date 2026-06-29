"use strict";
/**
 * Simple in-memory TTL cache to replace Next.js unstable_cache on the Express backend.
 * Entries expire after `ttlSeconds` and are evicted lazily on next access.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCache = withCache;
const store = new Map();
function withCache(fn, keyPrefix, ttlSeconds) {
    return async (...args) => {
        const key = `${keyPrefix}:${JSON.stringify(args)}`;
        const now = Date.now();
        const cached = store.get(key);
        if (cached && cached.expiresAt > now) {
            return cached.value;
        }
        const result = await fn(...args);
        store.set(key, { value: result, expiresAt: now + ttlSeconds * 1000 });
        return result;
    };
}
//# sourceMappingURL=cache.js.map