import { prisma } from "@/lib/db";

export const updatePhoneNumber = async (tenantId: string, openId: string, phoneNumber: string) => {
  const user = await prisma.user.findUnique({ where: { tenantId_openId: { tenantId, openId } } });
  if (!user) {
    throw new Error("User not found");
  }
  const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { phoneNumber } });
  return updatedUser;
};
