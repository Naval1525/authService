import { Router } from "express";
import * as controller from "./controller.js";
import { authenticate } from "./middleware.js";

const router = Router();

// Public
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/verify-email", controller.verifyEmail);
router.post("/resend-verification", controller.resendVerification);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

// Protected
router.get("/me", authenticate, controller.me);
router.post("/logout", authenticate, controller.logout);
router.post("/logout-all", authenticate, controller.logoutAll);
router.get("/sessions", authenticate, controller.getSessions);
router.delete("/sessions/:id", authenticate, controller.revokeSession);
router.post("/change-password", authenticate, controller.changePassword);

export default router;
