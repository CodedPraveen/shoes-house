import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export const PRODUCT_UPLOAD_QUEUE = "product-upload";

export const productUploadQueue = new Queue(
    PRODUCT_UPLOAD_QUEUE,
    {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 3,
            removeOnComplete: 100,
            removeOnFail: 100,
            backoff: {
                type: "exponential",
                delay: 3000,
            },
        },
    }
);

export async function addProductUploadJob(productData) {
    return productUploadQueue.add(
        "create-product",
        productData
    );
}