import { createTenantPrismaClient } from "@/lib/db";
import type { CarCategory, CarTrim, VehicleScenario } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateCarCategoryInput, CreateCarTrimInput, CreateVehicleScenarioInput } from "./schema";

// This service will contain all business logic related to cars,
// including categories, trims, and scenarios.

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

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findMany();
};

export const getVehicleScenarioById = async (tenantId: string, id: string): Promise<VehicleScenario | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findUnique({ where: { id } });
};

export const createVehicleScenario = async (
  tenantId: string,
  data: CreateVehicleScenarioInput,
): Promise<VehicleScenario> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.create({
    data: {
      ...data,
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
  });
};

export const updateVehicleScenario = async (
  tenantId: string,
  id: string,
  data: Prisma.VehicleScenarioUpdateInput,
): Promise<VehicleScenario | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.update({
    where: { id },
    data,
  });
};

export const deleteVehicleScenario = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  await prisma.vehicleScenario.delete({ where: { id } });
};
