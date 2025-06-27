import { prisma as db } from "../../../../lib/db";
import { transformContactUsConfig } from "../../../../lib/transform";

export async function getContactUsConfig(tenantId: string) {
  const config = await db.contactUsConfig.findUnique({
    where: { tenantId },
  });

  if (!config) {
    return null;
  }

  return transformContactUsConfig(config);
}
