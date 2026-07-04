import { AppError } from "../../core/errors/AppError.js";
import { findByEmail, createUser } from "./auth.repository.js";
import argon2 from "argon2";
import { RegisterDto } from "./auth.types.js";

export const register = async (dto: RegisterDto) => {
    const existingUser = await findByEmail(dto.email);
  
    if (existingUser) {
      throw new AppError(409, "Email already exists");
    }
  
    const passwordHash = await argon2.hash(dto.password);

    return createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
  };