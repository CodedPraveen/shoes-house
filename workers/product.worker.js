import { Worker, UnrecoverableError } from "bullmq";
import { prisma } from "../lib/db.js";
import { getBullMqConnectionOptions } from "../lib/queues/connection.js";
import { getBullMqEnvironment } from "../schemas/queue.schema.js";
import { PRODUCT_IMAGE_QUEUE } from "../queues/image.queue.js";
import { processProductImageJob } from "./image.worker.js";

function log(level, event, context = {}) {
  console[level](JSON.stringify({ service: "bullmq-worker", queue: PRODUCT_IMAGE_QUEUE, event, ...context }));
}

export function createProductWorker() {
  const config = getBullMqEnvironment();
  const worker = new Worker(PRODUCT_IMAGE_QUEUE, processProductImageJob, {
    connection: getBullMqConnectionOptions(process.env, { worker: true }),
    concurrency: config.BULLMQ_WORKER_CONCURRENCY,
    limiter: {
      max: config.BULLMQ_WORKER_RATE_MAX,
      duration: config.BULLMQ_WORKER_RATE_DURATION_MS,
    },
  });

  worker.on("active", (job) => log("info", "active", {
    jobId: job.id,
    productId: job.data?.productId,
    attempt: job.attemptsMade + 1,
  }));

  worker.on("completed", (job) => log("info", "completed", {
    jobId: job.id,
    productId: job.data?.productId,
    attemptsMade: job.attemptsMade,
  }));

  worker.on("failed", async (job, error) => {
    const attempts = job?.opts?.attempts ?? 1;
    const finalFailure = error instanceof UnrecoverableError || (job?.attemptsMade ?? 0) >= attempts;
    const productId = job?.data?.productId;

    log("error", "failed", {
      jobId: job?.id,
      productId,
      attempt: job?.attemptsMade,
      attempts,
      finalFailure,
      error: error?.message || "Unknown worker failure",
    });

    if (finalFailure && typeof productId === "string") {
      try {
        await prisma.product.updateMany({
          where: { id: productId, deletedAt: null, processingStatus: { not: "READY" } },
          data: {
            processingStatus: "FAILED",
            processingError: String(error?.message || "Image processing failed").slice(0, 1000),
          },
        });
      } catch (statusError) {
        log("error", "failed-status-update", {
          jobId: job?.id,
          productId,
          error: statusError?.message || "Unable to update product status",
        });
      }
    }
  });

  worker.on("error", (error) => log("error", "worker-error", {
    error: error?.message || "Unknown worker error",
  }));

  return worker;
}
