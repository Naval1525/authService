import { prisma } from "../../database/prisma.js";
import { Prisma, VerificationTokenType } from "@prisma/client";

export const findByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data });
};

// ---------- Sessions ----------

export const createSession = async (data: Prisma.SessionCreateInput) => {
  return prisma.session.create({ data });
};

export const findSessionById = async (id: string) => {
  return prisma.session.findUnique({ where: { id } });
};

export const findSessionsByUser = async (userId: string) => {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { lastActiveAt: "desc" },
  });
};

export const updateSession = async (
  id: string,
  data: Prisma.SessionUpdateInput
) => {
  return prisma.session.update({ where: { id }, data });
};

export const deleteSession = async (id: string) => {
  return prisma.session.deleteMany({ where: { id } });
};

export const deleteSessionsByUser = async (userId: string) => {
  return prisma.session.deleteMany({ where: { userId } });
};

export const deleteOtherSessions = async (userId: string, keepId: string) => {
  return prisma.session.deleteMany({
    where: { userId, id: { not: keepId } },
  });
};

// ---------- Verification tokens ----------

export const createVerificationToken = async (
  data: Prisma.VerificationTokenCreateInput
) => {
  return prisma.verificationToken.create({ data });
};

export const findVerificationToken = async (
  tokenHash: string,
  type: VerificationTokenType
) => {
  return prisma.verificationToken.findFirst({
    where: { tokenHash, type },
  });
};

export const deleteVerificationTokensByUser = async (
  userId: string,
  type: VerificationTokenType
) => {
  return prisma.verificationToken.deleteMany({
    where: { userId, type },
  });
};
