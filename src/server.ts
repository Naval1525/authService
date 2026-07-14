import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./core/logger/index.js";
import { prisma } from "./database/prisma.js";
import { redis } from "./redis/client.js";
async function start(){
    await prisma.$connect();
    // ioredis auto-connects on construction; no explicit connect() needed.
    app.listen(env.PORT, async () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        await redis.set("test", "test");
        const value = await redis.get("test");
        console.log(value);
    });
}
start();
const shutdown = async () => {
  logger.info("Shutting down...");

  await prisma.$disconnect();

  await redis.quit();

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);