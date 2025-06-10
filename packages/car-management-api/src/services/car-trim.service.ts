import { PrismaClient, CarTrim, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCarTrims = async (categoryId: string): Promise<CarTrim[]> => {
  return prisma.carTrim.findMany({ where: { categoryId } });
};

export const getCarTrimById = async (id: string): Promise<CarTrim | null> => {
  return prisma.carTrim.findUnique({ where: { id } });
};

export const createCarTrim = async (data: Prisma.CarTrimCreateInput): Promise<CarTrim> => {
  return prisma.carTrim.create({ data });
};

export const updateCarTrim = async (id: string, data: Prisma.CarTrimUpdateInput): Promise<CarTrim | null> => {
  return prisma.carTrim.update({
    where: { id },
    data,
  });
};

export const deleteCarTrim = async (id: string): Promise<void> => {
  await prisma.carTrim.delete({ where: { id } });
}; 