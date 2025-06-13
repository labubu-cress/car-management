import { createTenantPrismaClient } from "@/lib/db";
import type { CarTrim } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateCarTrimInput } from "./schema";

export const getAllCarTrims = async (tenantId: string, categoryId: string): Promise<CarTrim[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.findMany({ where: { categoryId } });
};

export const getCarTrimById = async (tenantId: string, id: string): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carTrim.findUnique({ where: { id } });
};

export const createCarTrim = async (tenantId: string, data: CreateCarTrimInput): Promise<CarTrim> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { categoryId, ...restData } = data;
  return prisma.carTrim.create({
    data: {
      ...restData,
      features: JSON.stringify(restData.features || []),
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      category: {
        connect: {
          id: categoryId,
        },
      },
    },
  });
};

export const updateCarTrim = async (
  tenantId: string,
  id: string,
  data: Omit<Prisma.CarTrimUpdateInput, "tenant" | "category">,
): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const dataForUpdate = { ...data };
  if (data.features) {
    dataForUpdate.features = JSON.stringify(data.features);
  }
  return prisma.carTrim.update({
    where: { id },
    data: dataForUpdate,
  });
};

export const deleteCarTrim = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carTrim.delete({ where: { id } });
};
