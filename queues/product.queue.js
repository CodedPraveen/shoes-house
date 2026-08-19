import { productImageJobSchema } from "../schemas/queue.schema.js";
import { getProductImageQueue } from "./image.queue.js";

export function productImageJobId(productId) {
  return `product-images-${productId}`;
}

export async function enqueueProductImages(payload) {
  const parsed = productImageJobSchema.parse(payload);
  const queue = getProductImageQueue();

  return queue.add("finalize-product-images", parsed, {
    jobId: productImageJobId(parsed.productId),
  });
}

export async function getProductImageJobState(productId) {
  const job = await getProductImageQueue().getJob(productImageJobId(productId));
  return job ? job.getState() : null;
}

export async function retryProductImages(payload) {
  const parsed = productImageJobSchema.parse(payload);
  const queue = getProductImageQueue();
  const existing = await queue.getJob(productImageJobId(parsed.productId));

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

  return enqueueProductImages(parsed);
}
