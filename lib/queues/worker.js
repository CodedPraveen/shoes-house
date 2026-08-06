import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { PRODUCT_UPLOAD_QUEUE } from "./product-upload-queue";
import { processProductUploadJob } from "@/services/jobs/product-upload-job";

const worker = new Worker(
    PRODUCT_UPLOAD_QUEUE,
    async (job) => {

        console.log(`Starting Job ${job.id}`);

        await processProductUploadJob(job.data);

        console.log(`Finished Job ${job.id}`);

    },
    {
        connection: redisConnection,
        concurrency: 3,
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed`);
    console.error(err);
});

worker.on("error", (err) => {
    console.error("Worker Error");
    console.error(err);
});

console.log("🚀 Product Upload Worker Started");