import { createTenantPrismaClient } from "@/lib/db";
import { z } from "zod";
import { carCategorySchema, type CarCategory, type CreateCarCategoryInput, type UpdateCarCategoryInput } from "./schema";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  const categories = await prisma.carCategory.findMany();
  return z.array(carCategorySchema).parse(categories);
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const category = await prisma.carCategory.findUnique({ where: { id } });
  if (!category) {
    return null;
  }
  return carCategorySchema.parse(category);
};

export const createCarCategory = async (tenantId: string, data: CreateCarCategoryInput): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  const newCategory = await prisma.carCategory.create({
    data: {
      ...data,
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
  });
  return carCategorySchema.parse(newCategory);
};

export const updateCarCategory = async (
  tenantId: string,
  id: string,
  data: UpdateCarCategoryInput,
): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const updatedCategory = await prisma.carCategory.update({
    where: { id },
    data: data,
  });
  return carCategorySchema.parse(updatedCategory);
};

export const deleteCarCategory = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carCategory.delete({ where: { id } });
};
