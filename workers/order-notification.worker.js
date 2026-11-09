import { Worker } from "bullmq";
import { getBullMqConnectionOptions } from "../lib/queues/connection.js";
import { ORDER_NOTIFICATION_QUEUE } from "../queues/order-notification.queue.js";
import { processOrderNotifications } from "../services/notifications/order-notification-processor.js";

export function createOrderNotificationWorker() {
  const worker = new Worker(
    ORDER_NOTIFICATION_QUEUE,
    (job) => processOrderNotifications({ orderId: job.data?.orderId || null }),
    { connection: getBullMqConnectionOptions(process.env, { worker: true }), concurrency: 3 },
  );
  worker.on("error", (error) => {
    console.error(JSON.stringify({ service: "notification-worker", event: "worker-error", error: error?.message || "Unknown worker error" }));
  });
  return worker;
}
