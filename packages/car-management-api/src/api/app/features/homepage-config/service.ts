import { prisma as db } from "../../../../lib/db";

export async function getHomepageConfig(tenantId: string) {
  return db.homepageConfig.findUnique({
    where: { tenantId },
  });
}
