import IORedis from "ioredis";

const globalForRedis = globalThis;

export const redisConnection =
    globalForRedis.redisConnection ??
    new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redisConnection = redisConnection;
}