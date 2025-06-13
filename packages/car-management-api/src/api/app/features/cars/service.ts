import { prisma } from "@/lib/db";
import { type CarCategory, type CarTrim, type VehicleScenario } from "@prisma/client";

// This service will contain all business logic related to cars,
// including categories, trims, and scenarios for the APP side.

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  return prisma.carCategory.findMany({ where: { tenantId } });
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  return prisma.carCategory.findUnique({ where: { id, tenantId } });
};

export const getAllCarTrims = async (tenantId: string, categoryId: string): Promise<CarTrim[]> => {
  return prisma.carTrim.findMany({ where: { categoryId, tenantId } });
};

export const getCarTrimById = async (tenantId: string, id: string): Promise<CarTrim | null> => {
  return prisma.carTrim.findUnique({ where: { id, tenantId } });
};

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  return prisma.vehicleScenario.findMany({ where: { tenantId } });
};

export const getVehicleScenarioById = async (tenantId: string, id: string): Promise<VehicleScenario | null> => {
  return prisma.vehicleScenario.findUnique({ where: { id, tenantId } });
};
