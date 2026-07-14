import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../../core/logger/index.js";

// Falls back to a JSON transport (logs the mail instead of sending)
// when SMTP is not configured, so dev works without real credentials.
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export const sendMail = async (options: SendMailOptions) => {
  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    ...options,
  });

  if (!env.SMTP_HOST) {
    logger.info(
      { to: options.to, subject: options.subject, text: options.text },
      "SMTP not configured — email logged instead of sent"
    );
  }

  return info;
};
