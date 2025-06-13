import { prisma } from "@/lib/db";
import { type CarCategory } from "@prisma/client";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  return prisma.carCategory.findMany({ where: { tenantId } });
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  return prisma.carCategory.findUnique({ where: { id, tenantId } });
};
