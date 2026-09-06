import { z } from "zod";
const imageIdSchema = z.string().regex(/^i_[a-f0-9]{32}$/);
const entityIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);

const stagedImageSchema = z.object({
  imageId: imageIdSchema,
  sortOrder: z.number().int().min(0).max(1000),
});

export const productImageJobSchema = z.object({
  type: z.literal("product").default("product"),
  productId: z.string().trim().min(1).max(100),
  images: z.array(stagedImageSchema).min(1).max(8),
  retainedImages: z.array(z.object({
    imageId: entityIdSchema,
    sortOrder: z.number().int().min(0).max(1000),
  })).max(8).default([]),
  stagingRecord: z.array(z.string().trim().min(1).max(200)).min(1).max(8),
});

export const bannerImageJobSchema = z.object({
  type: z.literal("banner"),
  bannerId: entityIdSchema,
  mediaAssetId: entityIdSchema,
  create: z.boolean(),
  image: stagedImageSchema,
  data: z.object({
    collection: z.enum(["SHOES", "JEWELLERY"]),
    alt: z.string().trim().min(1).max(160),
    enabled: z.boolean(),
    sortOrder: z.number().int(),
    targetType: z.enum(["COLLECTION", "CATEGORY", "PRODUCT", "CUSTOM"]),
    categoryId: entityIdSchema.nullable(),
    productId: entityIdSchema.nullable(),
    customHref: z.string().max(300).nullable(),
  }),
});

export const imageJobSchema = z.discriminatedUnion("type", [
  productImageJobSchema,
  bannerImageJobSchema,
]);

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
  IMAGE_STORAGE_ROOT: z.string().trim().min(1).optional(),
});

export function getBullMqEnvironment(environment = process.env) {
  return bullMqEnvironmentSchema.parse(environment);
}

export function getWorkerEnvironment(environment = process.env) {
  return workerEnvironmentSchema.parse(environment);
}
