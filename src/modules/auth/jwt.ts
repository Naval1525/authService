import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export type JwtPayload = {
  id: string;
  email: string;
  sid: string;
};

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const generateAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

export const generateRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
    // Unique id per token — without it, two tokens signed in the same
    // second are byte-identical and rotation/reuse detection breaks.
    jwtid: crypto.randomUUID(),
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
