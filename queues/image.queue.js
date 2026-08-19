import { Queue } from "bullmq";
import { getBullMqConnectionOptions } from "../lib/queues/connection.js";

export const PRODUCT_IMAGE_QUEUE = "product-image-processing";

const globalForQueues = globalThis;

export function getProductImageQueue() {
  if (!globalForQueues.productImageQueue) {
    globalForQueues.productImageQueue = new Queue(PRODUCT_IMAGE_QUEUE, {
      connection: getBullMqConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: { age: 24 * 60 * 60, count: 1000 },
        removeOnFail: { age: 7 * 24 * 60 * 60, count: 5000 },
      },
    });
  }

  return globalForQueues.productImageQueue;
}
