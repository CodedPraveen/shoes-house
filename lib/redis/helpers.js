import {
    getCache,
    setCache,
    deleteCache,
    deletePattern,
} from "./cache";

/**
 * Safe cache read.
 */
export async function safeGetCache(key) {
    try {
        return await getCache(key);
    } catch (err) {
        console.error("[Redis GET]", err.message);
        return null;
    }
}

/**
 * Safe cache write.
 */
export async function safeSetCache(key, value, ttl) {
    try {
        return await setCache(key, value, ttl);
    } catch (err) {
        console.error("[Redis SET]", err.message);
        return value;
    }
}

/**
 * Safe delete.
 */
export async function safeDeleteCache(key) {
    try {
        await deleteCache(key);
    } catch (err) {
        console.error("[Redis DEL]", err.message);
    }
}

/**
 * Safe delete by pattern.
 */
export async function safeDeletePattern(pattern) {
    try {
        await deletePattern(pattern);
    } catch (err) {
        console.error("[Redis DEL PATTERN]", err.message);
    }
}

/**
 * Cache hit logger.
 */
export function logCacheHit(key) {
    if (process.env.NODE_ENV !== "production") {
        console.log(`🟢 Redis HIT  → ${key}`);
    }
}

/**
 * Cache miss logger.
 */
export function logCacheMiss(key) {
    if (process.env.NODE_ENV !== "production") {
        console.log(`🟡 Redis MISS → ${key}`);
    }
}

/**
 * Cache write logger.
 */
export function logCacheWrite(key) {
    if (process.env.NODE_ENV !== "production") {
        console.log(`🔵 Redis SAVE → ${key}`);
    }
}