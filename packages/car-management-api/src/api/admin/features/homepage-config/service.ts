import type { z } from "zod";
import { prisma as db } from "../../../../lib/db";
import type { HomepageConfigUpdateSchema } from "./schema";

export async function getHomepageConfig(tenantId: string) {
  return db.homepageConfig.findUnique({
    where: { tenantId },
  });
}

export async function upsertHomepageConfig(tenantId: string, data: z.infer<typeof HomepageConfigUpdateSchema>) {
  const updateData: any = { ...data };

  if (updateData.bannerImage) {
    updateData.bannerVideo = null;
    updateData.bannerTitle = null;
    updateData.bannerDescription = null;
  } else if (updateData.bannerVideo) {
    updateData.bannerImage = null;
  }

  return db.homepageConfig.upsert({
    where: { tenantId },
    update: updateData,
    create: {
      ...updateData,
      tenantId,
    },
  });
}
