import { CarCategory, Prisma } from '@prisma/client';
import { createTenantPrismaClient } from '../db/client';

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.findMany();
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.findUnique({ where: { id } });
};

export const createCarCategory = async (tenantId: string, data: Prisma.CarCategoryCreateInput): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.create({ data });
};

export const updateCarCategory = async (tenantId: string, id: string, data: Prisma.CarCategoryUpdateInput): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.update({
    where: { id },
    data,
  });
};

export const deleteCarCategory = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carCategory.delete({ where: { id } });
}; 