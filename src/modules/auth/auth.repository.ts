import { prisma } from "../../database/prisma.js";
import { Prisma } from "@prisma/client";
export const findByEmail = async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  };
  
  export const createUser = async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  };