import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("8080"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    JWT_SECRET: z.string(),
    APP_URL: z.string().default("http://localhost:8080"),
    REDIS_URL: z.string(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().default("Auth Service <no-reply@auth-service.local>"),
  });

  export const env = envSchema.parse(process.env);
