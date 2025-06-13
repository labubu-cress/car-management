import { createTenantPrismaClient, prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export const updatePhoneNumber = async (tenantId: string, openId: string, phoneNumber: string) => {
  const user = await prisma.user.findUnique({ where: { tenantId_openId: { tenantId, openId } } });
  if (!user) {
    throw new Error("User not found");
  }
  await prisma.user.update({ where: { id: user.id }, data: { phoneNumber } });
};

export const getUserById = async (tenantId: string, id: string): Promise<User | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.user.findUnique({ where: { id } });
};
