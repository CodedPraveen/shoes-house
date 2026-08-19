import { z } from "zod";
import { productImageReferenceSchema } from "./product.schema.js";

export const productImageJobSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  images: z.array(productImageReferenceSchema).min(1).max(8),
});

export const bullMqEnvironmentSchema = z.object({
  REDIS_URL: z.string().url().refine(
    (value) => value.startsWith("redis://") || value.startsWith("rediss://"),
    "REDIS_URL must use redis:// or rediss://",
  ),
  BULLMQ_WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3),
  BULLMQ_WORKER_RATE_MAX: z.coerce.number().int().min(1).max(1000).default(20),
  BULLMQ_WORKER_RATE_DURATION_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  BULLMQ_REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().min(500).max(30000).default(3000),
});

export const workerEnvironmentSchema = bullMqEnvironmentSchema.extend({
  DATABASE_URL: z.string().trim().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
  CLOUDINARY_API_KEY: z.string().trim().min(1),
  CLOUDINARY_API_SECRET: z.string().trim().min(1),
});

export function getBullMqEnvironment(environment = process.env) {
  return bullMqEnvironmentSchema.parse(environment);
}

export function getWorkerEnvironment(environment = process.env) {
  return workerEnvironmentSchema.parse(environment);
}
