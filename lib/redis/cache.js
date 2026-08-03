import redis from "./redis";
import {
    redisGet,
    redisSet,
    redisDel,
} from "@/lib/redis/safe-redis";

export async function getCache(key, value, ttl) {
    // const value = await redisGet(key);

    return value ? JSON.parse(value) : null;
}

export async function setCache(key, value, ttl = 300) {
    await redisSet(key, JSON.stringify(value), ttl);
    return value;
}

export async function deleteCache(key) {
    await redisDel(key);
}

export async function deletePattern(pattern) {
    if (!redis) return;

    try {
        const keys = await redis.keys(pattern);

        if (keys.length) {
            // await redis.del(...keys);
            return await redis.get(key);
        }
    } catch { }
}