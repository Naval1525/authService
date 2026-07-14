import { Worker } from "bullmq";
import { EMAIL_QUEUE } from "../queues/email.queue.js";
import { bullConnection } from "../connection.js";
import { sendMail } from "../../modules/mail/mailer.js";
import { logger } from "../../core/logger/index.js";

// Job data is already a rendered email, so the processor is a one-liner.
// This runs in the separate worker process (src/worker.ts), not the API.
export const emailWorker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    await sendMail(job.data);
  },
  { connection: bullConnection }
);

emailWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, name: job.name }, "Email job completed");
});

emailWorker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, name: job?.name, attemptsMade: job?.attemptsMade, err },
    "Email job failed"
  );
});
