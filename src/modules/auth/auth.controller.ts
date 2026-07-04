import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { registerSchema } from "./auth.validation.js";
import { register as registerService } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const dto = registerSchema.parse(req.body);

  await registerService(dto);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
});