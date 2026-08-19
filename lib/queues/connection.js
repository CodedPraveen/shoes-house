import { getBullMqEnvironment } from "../../schemas/queue.schema.js";

/**
 * BullMQ manages its own Redis connections. Returning connection options keeps
 * the Vercel producer and Render worker lifecycles independent while reusing
 * the same Redis infrastructure and ioredis implementation used by BullMQ.
 */
export function getBullMqConnectionOptions(environment = process.env, { worker = false } = {}) {
  const config = getBullMqEnvironment(environment);
  const redisUrl = new URL(config.REDIS_URL);
  const database = redisUrl.pathname.length > 1 ? Number(redisUrl.pathname.slice(1)) : 0;

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username ? decodeURIComponent(redisUrl.username) : undefined,
    password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
    db: Number.isInteger(database) ? database : 0,
    ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
    connectTimeout: config.BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
    maxRetriesPerRequest: worker ? null : 1,
    enableReadyCheck: false,
  };
}
