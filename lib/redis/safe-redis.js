import redis from "./redis";

export async function redisGet(key) {
    if (!redis) return null;

    try {
        return await redis.get(key);
    } catch {
        return null;
    }
}

export async function redisSet(key, value, ttl) {
    if (!redis) return;

    try {
        if (ttl) {
            await redis.set(key, value, "EX", ttl);
        } else {
            await redis.set(key, value);
        }
    } catch { }
}

export async function redisDel(key) {
    if (!redis) return;

    try {
        await redis.del(key);
    } catch { }
}