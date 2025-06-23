import { createTenantPrismaClient } from "@/lib/db";
import { z } from "zod";
import {
  carCategorySchema,
  type CarCategory,
  type CreateCarCategoryInput,
  type UpdateCarCategoryInput,
} from "./schema";

export const getAllCarCategories = async (
  tenantId: string,
  name?: string,
  vehicleScenarioId?: string,
): Promise<CarCategory[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }
  if (vehicleScenarioId) {
    where.vehicleScenarioId = vehicleScenarioId;
  }

  const categories = await prisma.carCategory.findMany({
    where,
    include: {
      vehicleScenario: true,
      carTrims: {
        select: {
          isArchived: true,
        },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  const categoriesWithArchived = categories.map((c) => {
    const isArchived = c.carTrims.length > 0 && c.carTrims.every((t) => t.isArchived);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { carTrims, ...rest } = c;
    return {
      ...rest,
      isArchived,
    };
  });

  return z.array(carCategorySchema).parse(categoriesWithArchived);
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const category = await prisma.carCategory.findFirst({
    where: { id, tenantId },
    include: {
      vehicleScenario: true,
      carTrims: {
        select: {
          isArchived: true,
        },
      },
    },
  });
  if (!category) {
    return null;
  }

  const isArchived = category.carTrims.length > 0 && category.carTrims.every((t) => t.isArchived);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { carTrims, ...rest } = category;

  return carCategorySchema.parse({
    ...rest,
    isArchived,
  });
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
  return carCategorySchema.parse({ ...newCategory, isArchived: false });
};

export const updateCarCategory = async (
  tenantId: string,
  id: string,
  data: UpdateCarCategoryInput,
): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  const { vehicleScenarioId, isArchived, ...restData } = data;

  if (typeof isArchived === "boolean") {
    await prisma.carTrim.updateMany({
      where: {
        categoryId: id,
      },
      data: {
        isArchived,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...restData };
  if (vehicleScenarioId) {
    updateData.vehicleScenario = { connect: { id: vehicleScenarioId } };
  }

  const updatedCategoryWithTrims = await prisma.carCategory.update({
    where: { id },
    data: updateData,
    include: {
      vehicleScenario: true,
      carTrims: {
        select: {
          isArchived: true,
        },
      },
    },
  });

  const isArchivedComputed =
    updatedCategoryWithTrims.carTrims.length > 0 && updatedCategoryWithTrims.carTrims.every((t) => t.isArchived);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { carTrims, ...rest } = updatedCategoryWithTrims;

  return carCategorySchema.parse({
    ...rest,
    isArchived: isArchivedComputed,
  });
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
