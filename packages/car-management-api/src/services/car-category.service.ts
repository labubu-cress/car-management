import { PrismaClient, CarCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  return prisma.carCategory.findMany({ where: { tenantId } });
};

export const getCarCategoryById = async (id: string): Promise<CarCategory | null> => {
  return prisma.carCategory.findUnique({ where: { id } });
};

export const createCarCategory = async (data: Prisma.CarCategoryCreateInput): Promise<CarCategory> => {
  return prisma.carCategory.create({ data });
};

export const updateCarCategory = async (id: string, data: Prisma.CarCategoryUpdateInput): Promise<CarCategory | null> => {
  return prisma.carCategory.update({
    where: { id },
    data,
  });
};

export const deleteCarCategory = async (id: string): Promise<void> => {
  await prisma.carCategory.delete({ where: { id } });
}; 