import { prisma } from "@/lib/db";
import { password2hash, verifyPassword } from "@/lib/transform";
import { Prisma } from "@prisma/client";
import type { CreateAdminUserInput, UpdateAdminUserInput } from "./schema";
import type { AdminUser } from "./types";

export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  return prisma.adminUser.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAdminUserById = async (id: string): Promise<AdminUser | null> => {
  return prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getAdminUserByUsername = async (username: string): Promise<AdminUser | null> => {
  const user = await prisma.adminUser.findUnique({
    where: { username },
  });
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
};

export const createAdminUser = async (data: CreateAdminUserInput): Promise<AdminUser> => {
  const passwordHash = password2hash(data.password);
  const newUser = await prisma.adminUser.create({
    data: {
      username: data.username,
      passwordHash,
      role: data.role,
      tenantId: data.tenantId,
    },
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return newUser;
};

export const updateAdminUser = async (id: string, data: UpdateAdminUserInput): Promise<AdminUser> => {
  const updateData: Prisma.AdminUserUpdateInput = { ...data };
  if (data.password) {
    updateData.passwordHash = password2hash(data.password);
    delete (updateData as Partial<UpdateAdminUserInput>).password;
  }

  const updatedUser = await prisma.adminUser.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updatedUser;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await prisma.adminUser.delete({ where: { id } });
};

export const verifyAdminUserPassword = async (password: string, hash: string) => {
  return verifyPassword(password, hash);
};
