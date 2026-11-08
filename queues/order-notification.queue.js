import { Queue } from "bullmq";
import { getBullMqConnectionOptions } from "../lib/queues/connection.js";

export const ORDER_NOTIFICATION_QUEUE = "order-notifications";
let queue;

function getQueue() {
  if (!queue) {
    queue = new Queue(ORDER_NOTIFICATION_QUEUE, {
      connection: getBullMqConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  return queue;
}

export async function enqueueOrderNotifications(orderId) {
  return getQueue().add("deliver-order-notifications", { orderId }, {
    jobId: `order-notifications-${orderId}`,
  });
}

export async function scheduleNotificationSweep() {
  return getQueue().upsertJobScheduler(
    "order-notification-sweep",
    { every: 60_000 },
    { name: "sweep-order-notifications", data: {} },
  );
}
