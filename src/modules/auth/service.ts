import crypto from "crypto";
import argon2 from "argon2";
import { AppError } from "../../core/errors/AppError.js";
import { logger } from "../../core/logger/index.js";
import {
  findByEmail,
  findUserById,
  createUser,
  updateUser,
  createSession,
  findSessionById,
  findSessionsByUser,
  updateSession,
  deleteSession,
  deleteSessionsByUser,
  deleteOtherSessions,
  createVerificationToken,
  findVerificationToken,
  deleteVerificationTokensByUser,
} from "./repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_TTL_MS,
} from "./jwt.js";
import { hashToken, generateRandomToken } from "./token.js";
import {
  enqueueVerificationEmail,
  enqueuePasswordResetEmail,
  enqueuePasswordChangedEmail,
} from "../../jobs/index.js";
import { RegisterDto } from "./types.js";
import { LoginDto, ChangePasswordDto } from "./validation.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1h

type ClientInfo = {
  device?: string;
  ip?: string;
};

// ---------- helpers ----------

const issueTokens = async (
  user: { id: string; email: string },
  client: ClientInfo
) => {
  const sessionId = crypto.randomUUID();
  const payload = { id: user.id, email: user.email, sid: sessionId };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await createSession({
    id: sessionId,
    refreshTokenHash: hashToken(refreshToken),
    device: client.device,
    ip: client.ip,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    user: { connect: { id: user.id } },
  });

  return { accessToken, refreshToken };
};

const sendVerificationEmail = async (user: {
  id: string;
  name: string;
  email: string;
}) => {
  await deleteVerificationTokensByUser(user.id, "EMAIL_VERIFICATION");

  const token = generateRandomToken();
  await createVerificationToken({
    tokenHash: hashToken(token),
    type: "EMAIL_VERIFICATION",
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    user: { connect: { id: user.id } },
  });

  await enqueueVerificationEmail(user.email, user.name, token);
};

// ---------- core auth ----------

export const register = async (dto: RegisterDto) => {
  const existingUser = await findByEmail(dto.email);

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const passwordHash = await argon2.hash(dto.password);

  const user = await createUser({
    name: dto.name,
    email: dto.email,
    passwordHash,
  });

  try {
    await sendVerificationEmail(user);
  } catch (err) {
    logger.error({ err }, "Failed to send verification email");
  }

  return user;
};

export const login = async (dto: LoginDto, client: ClientInfo) => {
  const user = await findByEmail(dto.email);
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }
  const passwordMatch = await argon2.verify(user.passwordHash, dto.password);
  if (!passwordMatch) {
    throw new AppError(401, "Invalid credentials");
  }

  const tokens = await issueTokens(user, client);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    ...tokens,
  };
};

export const refresh = async (refreshToken: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const session = await findSessionById(payload.sid);
  if (!session) {
    throw new AppError(401, "Session not found");
  }

  if (session.refreshTokenHash !== hashToken(refreshToken)) {
    // Token reuse — an old (already rotated) refresh token was presented.
    // Kill the session so a potentially stolen token chain dies here.
    await deleteSession(session.id);
    throw new AppError(401, "Refresh token reuse detected");
  }

  if (session.expiresAt < new Date()) {
    await deleteSession(session.id);
    throw new AppError(401, "Session expired");
  }

  const newPayload = { id: payload.id, email: payload.email, sid: session.id };
  const accessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  await updateSession(session.id, {
    refreshTokenHash: hashToken(newRefreshToken),
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (sessionId: string) => {
  await deleteSession(sessionId);
};

export const logoutAll = async (userId: string) => {
  const { count } = await deleteSessionsByUser(userId);
  return count;
};

export const me = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
};

// ---------- sessions ----------

export const getSessions = async (userId: string, currentSessionId: string) => {
  const sessions = await findSessionsByUser(userId);
  return sessions.map((s) => ({
    id: s.id,
    device: s.device ?? "Unknown device",
    ip: s.ip ?? null,
    lastActive: s.lastActiveAt,
    createdAt: s.createdAt,
    current: s.id === currentSessionId,
  }));
};

export const revokeSession = async (userId: string, sessionId: string) => {
  const session = await findSessionById(sessionId);
  if (!session || session.userId !== userId) {
    throw new AppError(404, "Session not found");
  }
  await deleteSession(sessionId);
};

// ---------- email verification ----------

export const verifyEmail = async (token: string) => {
  const record = await findVerificationToken(
    hashToken(token),
    "EMAIL_VERIFICATION"
  );

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired verification token");
  }

  await updateUser(record.userId, { isEmailVerified: true });
  await deleteVerificationTokensByUser(record.userId, "EMAIL_VERIFICATION");
};

export const resendVerification = async (email: string) => {
  const user = await findByEmail(email);

  // Don't reveal whether the email exists
  if (!user || user.isEmailVerified) {
    return;
  }

  await sendVerificationEmail(user);
};

// ---------- password recovery ----------

export const forgotPassword = async (email: string) => {
  const user = await findByEmail(email);

  // Don't reveal whether the email exists
  if (!user) {
    return;
  }

  await deleteVerificationTokensByUser(user.id, "PASSWORD_RESET");

  const token = generateRandomToken();
  await createVerificationToken({
    tokenHash: hashToken(token),
    type: "PASSWORD_RESET",
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    user: { connect: { id: user.id } },
  });

  await enqueuePasswordResetEmail(user.email, user.name, token);
};

export const resetPassword = async (token: string, password: string) => {
  const record = await findVerificationToken(
    hashToken(token),
    "PASSWORD_RESET"
  );

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  const passwordHash = await argon2.hash(password);
  const user = await updateUser(record.userId, { passwordHash });

  await deleteVerificationTokensByUser(record.userId, "PASSWORD_RESET");
  // Log out everywhere — old sessions may belong to whoever forced the reset
  await deleteSessionsByUser(record.userId);

  try {
    await enqueuePasswordChangedEmail(user.email, user.name);
  } catch (err) {
    logger.error({ err }, "Failed to enqueue password changed email");
  }
};

export const changePassword = async (
  userId: string,
  currentSessionId: string,
  dto: ChangePasswordDto
) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const passwordMatch = await argon2.verify(
    user.passwordHash,
    dto.currentPassword
  );
  if (!passwordMatch) {
    throw new AppError(401, "Current password is incorrect");
  }

  const passwordHash = await argon2.hash(dto.newPassword);
  await updateUser(userId, { passwordHash });

  // Keep this session alive, kill the rest
  await deleteOtherSessions(userId, currentSessionId);

  try {
    await enqueuePasswordChangedEmail(user.email, user.name);
  } catch (err) {
    logger.error({ err }, "Failed to enqueue password changed email");
  }
};
