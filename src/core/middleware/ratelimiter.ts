//rule t requests,1 min , same ip , 429
import { NextFunction, Request, Response } from "express";
import { redis } from "../../redis/client.js";

export const rateLimiter =
  (limit: number, window: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? "unknown";

    const key = `rate-limit:${ip}`;

    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, window);
    }

    if(requests > limit) {
      return res.status(429).json({ message: "Too many requests" });
    }

    next();
  };