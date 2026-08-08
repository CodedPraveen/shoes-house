import redis from "@/lib/redis/redis";

const PREFIX = "lock:";

export async function acquireLock(key, ttl = 30) {
    const lockKey = PREFIX + key;

    if (!redis) return true;

    try {
        if (redis.status === "wait") {
            await redis.connect();
        }

        const ok = await redis.set(lockKey, "1", "EX", ttl, "NX");
        return ok === "OK";
    } catch {
        // PostgreSQL's guarded stock update remains authoritative when Redis
        // is unavailable, so checkout can safely fail open here.
        return true;
    }
}

export async function releaseLock(key) {
    if (!redis) return;

    try {
        await redis.del(PREFIX + key);
    } catch {
        // The TTL releases the lock if Redis becomes unavailable mid-request.
    }
}
