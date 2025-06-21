import { createTenantPrismaClient } from "@/lib/db";
import { z } from "zod";
import {
    carTrimSchema,
    carTrimWithFavoritesSchema,
    type CarTrim,
    type CarTrimWithFavorites,
    type CreateCarTrimInput,
    type UpdateCarTrimInput,
} from "./schema";

export const getAllCarTrims = async (tenantId: string, categoryId: string): Promise<CarTrim[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  const trims = await prisma.carTrim.findMany({
    where: { categoryId },
    orderBy: {
      displayOrder: "asc",
    },
  });
  return z.array(carTrimSchema).parse(trims);
};

export const getCarTrimById = async (tenantId: string, id: string): Promise<CarTrimWithFavorites | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const trim = await prisma.carTrim.findFirst({
    where: { id, tenantId },
    include: {
      favoritedBy: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      },
    },
  });
  if (!trim) {
    return null;
  }
  return carTrimWithFavoritesSchema.parse(trim);
};

export const createCarTrim = async (tenantId: string, data: CreateCarTrimInput): Promise<CarTrim> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { categoryId, ...restData } = data;

  const maxOrderTrim = await prisma.carTrim.findFirst({
    where: { categoryId },
    orderBy: { displayOrder: "desc" },
  });
  const nextOrder = maxOrderTrim ? maxOrderTrim.displayOrder + 1 : 0;

  const newTrim = await prisma.carTrim.create({
    data: {
      ...restData,
      displayOrder: nextOrder,
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

export const reorderCarTrims = async (tenantId: string, categoryId: string, trimIds: string[]): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);

  const trims = await prisma.carTrim.findMany({
    where: {
      id: { in: trimIds },
      categoryId,
      tenantId,
    },
    select: { id: true },
  });

  if (trims.length !== trimIds.length) {
    throw new Error("Some car trims not found in this category or access denied.");
  }

  const updates = trimIds.map((id, index) =>
    prisma.carTrim.update({
      where: { id },
      data: { displayOrder: index },
    }),
  );

  await prisma.$transaction(updates);
};
