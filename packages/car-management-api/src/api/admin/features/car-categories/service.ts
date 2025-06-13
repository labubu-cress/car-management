import { createTenantPrismaClient } from "@/lib/db";
import type { CarCategory } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateCarCategoryInput } from "./schema";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.findMany();
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.findUnique({ where: { id } });
};

export const createCarCategory = async (tenantId: string, data: CreateCarCategoryInput): Promise<CarCategory> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.carCategory.create({
    data: {
      ...data,
      tags: JSON.stringify(data.tags || []),
      highlights: JSON.stringify(data.highlights || []),
      interiorImages: JSON.stringify(data.interiorImages || []),
      exteriorImages: JSON.stringify(data.exteriorImages || []),
      offerPictures: JSON.stringify(data.offerPictures || []),
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
  });
};

export const updateCarCategory = async (
  tenantId: string,
  id: string,
  data: Omit<Prisma.CarCategoryUpdateInput, "tenant" | "vehicleScenarios">,
): Promise<CarCategory | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  const dataForUpdate = { ...data };
  if (data.tags) {
    dataForUpdate.tags = JSON.stringify(data.tags);
  }
  if (data.highlights) {
    dataForUpdate.highlights = JSON.stringify(data.highlights);
  }
  if (data.interiorImages) {
    dataForUpdate.interiorImages = JSON.stringify(data.interiorImages);
  }
  if (data.exteriorImages) {
    dataForUpdate.exteriorImages = JSON.stringify(data.exteriorImages);
  }
  if (data.offerPictures) {
    dataForUpdate.offerPictures = JSON.stringify(data.offerPictures);
  }
  return prisma.carCategory.update({
    where: { id },
    data: dataForUpdate,
  });
};

export const deleteCarCategory = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.carCategory.delete({ where: { id } });
};
