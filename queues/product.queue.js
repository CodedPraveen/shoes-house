import { bannerImageJobSchema, productImageJobSchema } from "../schemas/queue.schema.js";
import { getProductImageQueue } from "./image.queue.js";

export function productImageJobId(payload) {
  return `product-images-${payload.productId}-${payload.images[0].imageId}`;
}

export async function enqueueProductImages(payload) {
  const parsed = productImageJobSchema.parse({ ...payload, type: "product" });
  const queue = getProductImageQueue();
  return queue.add("finalize-product-images", parsed, {
    jobId: productImageJobId(parsed),
  });
}

export async function getProductImageJobState(jobId) {
  const job = await getProductImageQueue().getJob(String(jobId || ""));
  return job ? job.getState() : null;
}

export async function retryProductImages(payload, existingJobId = null) {
  const parsed = productImageJobSchema.parse({ ...payload, type: "product" });
  const queue = getProductImageQueue();
  const jobId = existingJobId || productImageJobId(parsed);
  const existing = await queue.getJob(jobId);

  if (existing) {
    const state = await existing.getState();
    if (state === "failed") {
      await existing.retry();
      return existing;
    }
    if (["waiting", "active", "delayed", "prioritized", "waiting-children"].includes(state)) {
      return existing;
    }
    await existing.remove();
  }

  return queue.add("finalize-product-images", parsed, { jobId });
}

export async function enqueueBannerImage(payload) {
  const parsed = bannerImageJobSchema.parse({ ...payload, type: "banner" });
  return getProductImageQueue().add("finalize-banner-image", parsed, {
    jobId: `banner-image-${parsed.bannerId}-${parsed.image.imageId}`,
  });
}
