import Redis from "ioredis";

const globalForRedis = globalThis;

export const redis =
    globalForRedis.redis ||
    new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

redis.on("error", (err) => {
    console.error("Redis:", err.message);
});

export default redis;