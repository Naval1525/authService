import { Router } from "express";
import authRoutes from "../modules/auth/routes.js";

const router = Router();

router.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "Authentication Service is running",
  });
});

router.use("/auth", authRoutes);

export default router;