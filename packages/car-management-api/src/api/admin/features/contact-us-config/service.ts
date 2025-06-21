import type { z } from "zod";
import { prisma as db } from "../../../../lib/db";
import type { ContactUsConfigUpdateSchema } from "./schema";

export async function getContactUsConfig(tenantId: string) {
  return db.contactUsConfig.findUnique({
    where: { tenantId },
  });
}

export async function upsertContactUsConfig(tenantId: string, data: z.infer<typeof ContactUsConfigUpdateSchema>) {
  return db.contactUsConfig.upsert({
    where: { tenantId },
    update: data,
    create: {
      ...data,
      tenantId,
    },
  });
} 