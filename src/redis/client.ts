import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("error", (err: Error) => {
    console.error(err);
});