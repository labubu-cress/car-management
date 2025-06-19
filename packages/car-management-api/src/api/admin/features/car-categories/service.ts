import { createTenantPrismaClient } from "@/lib/db";
import { z } from "zod";
import {
  carCategorySchema,
  type CarCategory,
  type CreateCarCategoryInput,
  type UpdateCarCategoryInput,
} from "./schema";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  const categories = await prisma.carCategory.findMany({
    include: { vehicleScenario: true },
    orderBy: {
      displayOrder: "asc",
    },
  });
  return z.array(carCategorySchema).parse(categories);
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const category = await prisma.carCategory.findFirst({
    where: { id, tenantId },
    include: { vehicleScenario: true },
  });
  if (!category) {
    return null;
  }
  return carCategorySchema.parse(category);
};

export const createCarCategory = async (tenantId: string, data: CreateCarCategoryInput): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { vehicleScenarioId, ...restData } = data;

  const maxOrderCategory = await prisma.carCategory.findFirst({
    where: { vehicleScenarioId },
    orderBy: { displayOrder: "desc" },
  });

  const nextOrder = maxOrderCategory ? maxOrderCategory.displayOrder + 1 : 0;

  const newCategory = await prisma.carCategory.create({
    data: {
      ...restData,
      displayOrder: nextOrder,
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      vehicleScenario: {
        connect: {
          id: vehicleScenarioId,
        },
      },
    },
    include: { vehicleScenario: true },
  });
  return carCategorySchema.parse(newCategory);
};

export const updateCarCategory = async (
  tenantId: string,
  id: string,
  data: UpdateCarCategoryInput,
): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { vehicleScenarioId, ...restData } = data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...restData };
  if (vehicleScenarioId) {
    updateData.vehicleScenario = { connect: { id: vehicleScenarioId } };
  }
  const updatedCategory = await prisma.carCategory.update({
    where: { id },
    data: updateData,
    include: { vehicleScenario: true },
  });
  return carCategorySchema.parse(updatedCategory);
};

export const deleteCarCategory = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carCategory.delete({ where: { id, tenantId } });
};

export const reorderCarCategories = async (
  tenantId: string,
  vehicleScenarioId: string,
  categoryIds: string[],
): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);

  await prisma.$transaction(
    categoryIds.map((id, index) =>
      prisma.carCategory.update({
        where: { id, tenantId, vehicleScenarioId },
        data: { displayOrder: index },
      }),
    ),
  );
};
