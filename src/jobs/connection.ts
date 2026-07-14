import type { ConnectionOptions } from "bullmq";
import { env } from "../config/env.js";

// BullMQ requires maxRetriesPerRequest to be null. We pass options (not an
// instance) so BullMQ builds the connection with its own bundled ioredis,
// avoiding version skew with the top-level ioredis. This is separate from the
// node-redis client in ../redis/client.ts used elsewhere (caching, rate limiting).
export const bullConnection: ConnectionOptions = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};
