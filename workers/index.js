import { prisma } from "../lib/db.js";
import { getWorkerEnvironment } from "../schemas/queue.schema.js";
import { createProductWorker } from "./product.worker.js";

getWorkerEnvironment();
const worker = createProductWorker();
let shuttingDown = false;

console.info(JSON.stringify({ service: "bullmq-worker", event: "started" }));

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(JSON.stringify({ service: "bullmq-worker", event: "shutdown", signal }));

  try {
    await worker.close();
    await prisma.$disconnect();
    process.exitCode = exitCode;
  } catch (error) {
    console.error(JSON.stringify({
      service: "bullmq-worker",
      event: "shutdown-error",
      error: error?.message || "Unknown shutdown error",
    }));
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("uncaughtException", (error) => {
  console.error(JSON.stringify({ service: "bullmq-worker", event: "uncaught-exception", error: error.message }));
  void shutdown("uncaughtException", 1);
});
process.once("unhandledRejection", (error) => {
  console.error(JSON.stringify({ service: "bullmq-worker", event: "unhandled-rejection", error: error?.message || String(error) }));
  void shutdown("unhandledRejection", 1);
});
