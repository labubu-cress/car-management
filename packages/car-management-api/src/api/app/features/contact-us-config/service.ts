import { prisma as db } from "../../../../lib/db";

export async function getContactUsConfig(tenantId: string) {
  return db.contactUsConfig.findUnique({
    where: { tenantId },
  });
} 