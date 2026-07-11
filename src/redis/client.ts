import { createClient } from "redis";
import { env } from "../config/env.js";


export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});