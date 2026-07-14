// Entry point for the background worker process. Runs independently of the API
// (`npm run worker`) so slow email delivery never blocks HTTP requests.
import { emailWorker } from "./jobs/workers/email.worker.js";
import { logger } from "./core/logger/index.js";

logger.info("📨 Email worker started");

const shutdown = async () => {
  logger.info("Worker shutting down…");
  await emailWorker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
