import {
    redisGet,
    redisSet,
    redisDel,
} from "@/lib/redis/safe-redis";

const PREFIX = "lock:";

export async function acquireLock(redis, key, ttl = 30) {
    const lockKey = PREFIX + key;

    const ok = await redis.set(lockKey, "1", "EX", ttl, "NX");

    return ok === "OK";
}

export async function releaseLock(key) {
    await redis.del(PREFIX + key);
}