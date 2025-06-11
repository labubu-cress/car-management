import { type AdminRole, type AdminUser, Prisma } from "@prisma/client";

import {
  type OmitPasswordHash,
  type ReplacePasswordHash,
} from "@/types/typeHelper";
import { prisma } from "../db/client";
import { password2hash } from "../utils/transform";

const adminUserLevel: Record<AdminRole, number> = {
  super_admin: 40,
  admin: 30,
  tenant_admin: 20,
  tenant_viewer: 10,
} as const;
export const getAdminUserRoleLevel = (role: AdminRole): number => {
  return adminUserLevel[role];
};

// Helper to remove password hash
const excludePasswordHash = <T extends AdminUser>(
  user: T
): OmitPasswordHash<T> => {
  const { passwordHash, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    role: userWithoutPassword.role as AdminRole,
  };
};

export const getAllAdminUsers = async (): Promise<
  OmitPasswordHash<AdminUser>[]
> => {
  const users = (await prisma.adminUser.findMany()) as AdminUser[];
  return users.map(excludePasswordHash);
};

export const getAdminUserById = async (
  id: string
): Promise<OmitPasswordHash<AdminUser> | null> => {
  const user = (await prisma.adminUser.findUnique({
    where: { id },
  })) as AdminUser | null;
  return user ? excludePasswordHash(user) : null;
};

export const createAdminUser = async (
  data: ReplacePasswordHash<Prisma.AdminUserCreateInput>
): Promise<OmitPasswordHash<AdminUser>> => {
  const passwordHash = password2hash(data.password);
  const newUser = await prisma.adminUser.create({
    data: {
      ...data,
      passwordHash,
    },
  });
  return excludePasswordHash(newUser);
};

export const updateAdminUser = async (
  id: string,
  data: ReplacePasswordHash<Prisma.AdminUserUpdateInput>
): Promise<OmitPasswordHash<AdminUser> | null> => {
  const { password, ...rest } = data;
  if (password) {
    (rest as Prisma.AdminUserUpdateInput).passwordHash =
      password2hash(password);
  }
  const updatedUser = await prisma.adminUser.update({
    where: { id },
    data: rest,
  });
  return updatedUser ? excludePasswordHash(updatedUser) : null;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await prisma.adminUser.delete({ where: { id } });
};
