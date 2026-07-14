import type { JobsOptions } from "bullmq";
import { emailQueue } from "../queues/email.queue.js";
import {
  verificationEmail,
  passwordResetEmail,
  passwordChangedEmail,
} from "../../modules/mail/templates.js";

// Shared retry/cleanup policy for every email job.
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};

// The auth module calls these — it never imports BullMQ directly.
export const enqueueVerificationEmail = (
  email: string,
  name: string,
  token: string
) =>
  emailQueue.add(
    "verify-email",
    { to: email, ...verificationEmail(name, token) },
    defaultJobOptions
  );

export const enqueuePasswordResetEmail = (
  email: string,
  name: string,
  token: string
) =>
  emailQueue.add(
    "password-reset",
    { to: email, ...passwordResetEmail(name, token) },
    defaultJobOptions
  );

export const enqueuePasswordChangedEmail = (email: string, name: string) =>
  emailQueue.add(
    "password-changed",
    { to: email, ...passwordChangedEmail(name) },
    defaultJobOptions
  );
