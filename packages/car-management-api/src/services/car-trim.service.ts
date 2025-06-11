import { type CarTrim, Prisma } from "@prisma/client";
import { createTenantPrismaClient } from "../db/client";

export const getAllCarTrims = async (
  tenantId: string,
  categoryId: string
): Promise<CarTrim[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.findMany({ where: { categoryId } });
};

export const getCarTrimById = async (
  tenantId: string,
  id: string
): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.findUnique({ where: { id } });
};

export const createCarTrim = async (
  tenantId: string,
  data: Prisma.CarTrimCreateInput
): Promise<CarTrim> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.create({ data });
};

export const updateCarTrim = async (
  tenantId: string,
  id: string,
  data: Prisma.CarTrimUpdateInput
): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.update({
    where: { id },
    data,
  });
};

export const deleteCarTrim = async (
  tenantId: string,
  id: string
): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carTrim.delete({ where: { id } });
};
