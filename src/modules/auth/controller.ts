import { asyncHandler } from "../../core/utils/asyncHandler.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./validation.js";
import * as authService from "./service.js";
import { parseDevice } from "./device.js";

export const register = asyncHandler(async (req, res) => {
  const dto = registerSchema.parse(req.body);

  await authService.register(dto);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Check your email to verify your account.",
  });
});

export const login = asyncHandler(async (req, res) => {
  const dto = loginSchema.parse(req.body);

  const data = await authService.login(dto, {
    device: parseDevice(req.headers["user-agent"]),
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const dto = refreshSchema.parse(req.body);

  const data = await authService.refresh(dto.refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed",
    data,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.sid);

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const count = await authService.logoutAll(req.user.id);

  res.status(200).json({
    success: true,
    message: `Logged out of ${count} session(s)`,
  });
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getSessions = asyncHandler(async (req, res) => {
  const data = await authService.getSessions(req.user.id, req.user.sid);

  res.status(200).json({
    success: true,
    data,
  });
});

export const revokeSession = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.user.id, req.params.id as string);

  res.status(200).json({
    success: true,
    message: "Session revoked",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const dto = verifyEmailSchema.parse(req.body);

  await authService.verifyEmail(dto.token);

  res.status(200).json({
    success: true,
    message: "Email verified",
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const dto = resendVerificationSchema.parse(req.body);

  await authService.resendVerification(dto.email);

  res.status(200).json({
    success: true,
    message: "If that email is registered and unverified, a verification email has been sent",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const dto = forgotPasswordSchema.parse(req.body);

  await authService.forgotPassword(dto.email);

  res.status(200).json({
    success: true,
    message: "If that email is registered, a password reset email has been sent",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const dto = resetPasswordSchema.parse(req.body);

  await authService.resetPassword(dto.token, dto.password);

  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please log in again.",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const dto = changePasswordSchema.parse(req.body);

  await authService.changePassword(req.user.id, req.user.sid, dto);

  res.status(200).json({
    success: true,
    message: "Password changed. Other sessions have been logged out.",
  });
});
