import { createTenantPrismaClient } from "@/lib/db";
import { z } from "zod";
import { carTrimSchema, type CarTrim, type CreateCarTrimInput, type UpdateCarTrimInput } from "./schema";

export const getAllCarTrims = async (tenantId: string, categoryId: string): Promise<CarTrim[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  const trims = await prisma.carTrim.findMany({ where: { categoryId } });
  return z.array(carTrimSchema).parse(trims);
};

export const getCarTrimById = async (tenantId: string, id: string): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const trim = await prisma.carTrim.findFirst({ where: { id, tenantId } });
  if (!trim) {
    return null;
  }
  return carTrimSchema.parse(trim);
};

export const createCarTrim = async (tenantId: string, data: CreateCarTrimInput): Promise<CarTrim> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { categoryId, ...restData } = data;
  const newTrim = await prisma.carTrim.create({
    data: {
      ...restData,
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
  return carTrimSchema.parse(newTrim);
};

export const updateCarTrim = async (
  tenantId: string,
  id: string,
  data: UpdateCarTrimInput,
): Promise<CarTrim | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const existingTrim = await prisma.carTrim.findFirst({ where: { id, tenantId } });
  if (!existingTrim) {
    return null;
  }
  const updatedTrim = await prisma.carTrim.update({
    where: { id },
    data: data,
  });
  return carTrimSchema.parse(updatedTrim);
};

export const deleteCarTrim = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  const existingTrim = await prisma.carTrim.findFirst({ where: { id, tenantId } });
  if (!existingTrim) {
    throw new Error("Car trim not found or access denied.");
  }
  await prisma.carTrim.delete({ where: { id } });
};
