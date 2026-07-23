import redis from "./redis";

export async function getCache(key) {
    const value = await redis.get(key);

    return value ? JSON.parse(value) : null;
}

export async function setCache(key, value, ttl = 300) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);

    return value;
}

export async function deleteCache(key) {
    await redis.del(key);
}

export async function deletePattern(pattern) {
    const keys = await redis.keys(pattern);

    if (keys.length) {
        await redis.del(...keys);
    }
}