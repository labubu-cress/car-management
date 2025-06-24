import { prisma } from "@/lib/db";
import type { Faq } from "@prisma/client";

export const getAllFaqs = async (tenantId: string): Promise<Faq[]> => {
  return prisma.faq.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
};
