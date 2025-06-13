import { prisma } from "@/lib/db";
import { type CarTrim } from "@prisma/client";

export const getAllCarTrims = async (tenantId: string, categoryId: string): Promise<CarTrim[]> => {
  return prisma.carTrim.findMany({ where: { categoryId, tenantId } });
};

export const getCarTrimById = async (tenantId: string, id: string): Promise<CarTrim | null> => {
  return prisma.carTrim.findUnique({ where: { id, tenantId } });
};
