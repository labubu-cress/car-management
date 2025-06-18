import type { z } from "zod";
import { prisma as db } from "../../../../lib/db";
import type { HomepageConfigUpdateSchema } from "./schema";

export async function getHomepageConfig(tenantId: string) {
  return db.homepageConfig.findUnique({
    where: { tenantId },
  });
}

export async function upsertHomepageConfig(tenantId: string, data: z.infer<typeof HomepageConfigUpdateSchema>) {
  return db.homepageConfig.upsert({
    where: { tenantId },
    update: data,
    create: {
      ...data,
      tenantId,
    },
  });
}
