import { Worker, UnrecoverableError } from "bullmq";
import { prisma } from "../lib/db.js";
import { getBullMqConnectionOptions } from "../lib/queues/connection.js";
import { getBullMqEnvironment } from "../schemas/queue.schema.js";
import { PRODUCT_IMAGE_QUEUE } from "../queues/image.queue.js";
import {
  cleanupFailedImageJob,
  processImageJob,
} from "./image.worker.js";

function log(level, event, context = {}) {
  console[level](
    JSON.stringify({
      service: "bullmq-worker",
      queue: PRODUCT_IMAGE_QUEUE,
      event,
      ...context,
    }),
  );
}

function getJobContext(job) {
  const data = job?.data || {};

  return {
    jobId: job?.id,
    type: data.type,
    productId: data.productId,
    bannerId: data.bannerId,
    categoryId: data.categoryId,
    imageCount: data.images?.length ?? (data.image ? 1 : undefined),
  };
}

export function createProductWorker() {
  const config = getBullMqEnvironment();

  const worker = new Worker(
    PRODUCT_IMAGE_QUEUE,
    processImageJob,
    {
      connection: getBullMqConnectionOptions(
        process.env,
        { worker: true },
      ),

      concurrency: config.BULLMQ_WORKER_CONCURRENCY,

      limiter: {
        max: config.BULLMQ_WORKER_RATE_MAX,
        duration: config.BULLMQ_WORKER_RATE_DURATION_MS,
      },
    },
  );

  worker.on("active", (job) => {
    log("info", "active", {
      ...getJobContext(job),
      attempt: (job.attemptsMade ?? 0) + 1,
    });
  });

  worker.on("completed", (job) => {
    log("info", "completed", {
      ...getJobContext(job),
      attemptsMade: job.attemptsMade,
    });
  });

  worker.on("failed", async (job, error) => {
    const attempts = job?.opts?.attempts ?? 1;

    const finalFailure =
      error instanceof UnrecoverableError ||
      (job?.attemptsMade ?? 0) >= attempts;

    const data = job?.data || {};
    const type = data.type;

    log("error", "failed", {
      ...getJobContext(job),
      attempt: job?.attemptsMade,
      attempts,
      finalFailure,
      error: error?.message || "Unknown worker failure",
    });

    /*
     * Product jobs have a processing state that needs to be
     * marked FAILED. Banner and category jobs do not use
     * product processing status.
     */
    if (
      finalFailure &&
      type === "product" &&
      typeof data.productId === "string"
    ) {
      try {
        await prisma.product.updateMany({
          where: {
            id: data.productId,
            deletedAt: null,
            processingStatus: {
              not: "READY",
            },
          },

          data: {
            processingStatus: "FAILED",
            processingError: String(
              error?.message ||
              "Image processing failed",
            ).slice(0, 1000),
          },
        });
      } catch (statusError) {
        log("error", "failed-status-update", {
          jobId: job?.id,
          type,
          productId: data.productId,
          error:
            statusError?.message ||
            "Unable to update product status",
        });
      }
    }

    /*
     * Clean staged uploads only after the job has
     * permanently failed.
     */
    if (finalFailure) {
      await cleanupFailedImageJob(job?.data).catch(
        (cleanupError) => {
          log("error", "failed-cleanup", {
            jobId: job?.id,
            type,
            error:
              cleanupError?.message ||
              "Unable to clean failed image job",
          });
        },
      );
    }
  });

  worker.on("error", (error) => {
    log("error", "worker-error", {
      error:
        error?.message ||
        "Unknown worker error",
    });
  });

  return worker;
}

export async function processImageJob(job) {
  const parsed = imageJobSchema.safeParse(job.data);

  if (!parsed.success) {
    throw new UnrecoverableError(
      "Invalid image job payload",
    );
  }

  if (parsed.data.type === "banner") {
    return processBannerImageJob(parsed.data);
  }

  if (parsed.data.type === "category") {
    return processCategoryImageJob(parsed.data);
  }

  return processProductImageJob(parsed.data);
}

export async function cleanupFailedImageJob(data) {
  const parsed = imageJobSchema.safeParse(data);

  if (!parsed.success) {
    return;
  }

  const images =
    parsed.data.type === "banner"
      ? [parsed.data.image]
      : parsed.data.type === "category"
        ? [parsed.data.image]
        : parsed.data.images;

  await cleanupStaged(images);
}