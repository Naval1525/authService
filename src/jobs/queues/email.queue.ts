import { Queue } from "bullmq";
import type { SendMailOptions } from "../../modules/mail/mailer.js";
import { bullConnection } from "../connection.js";

export const EMAIL_QUEUE = "email";

// A job's data is a fully-rendered email — the worker just hands it to sendMail().
// The job *name* ("verify-email", etc.) carries the semantics for observability.
export const emailQueue = new Queue<SendMailOptions>(EMAIL_QUEUE, {
  connection: bullConnection,
});
