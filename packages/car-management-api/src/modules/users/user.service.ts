import type { User } from "@prisma/client";
import { createTenantPrismaClient } from "../../lib/db";

export const getAllUsers = async (tenantId: string): Promise<User[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.user.findMany();
};

export const getUserById = async (tenantId: string, id: string): Promise<User | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.user.findUnique({ where: { id } });
};
