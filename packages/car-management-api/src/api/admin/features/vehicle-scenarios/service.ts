import { createTenantPrismaClient } from "@/lib/db";
import type { VehicleScenario } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateVehicleScenarioInput } from "./schema";

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findMany();
};

export const getVehicleScenarioById = async (tenantId: string, id: string): Promise<VehicleScenario | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findFirst({ where: { id, tenantId } });
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
  const existingScenario = await prisma.vehicleScenario.findFirst({ where: { id, tenantId } });
  if (!existingScenario) {
    return null; // Or throw an error
  }
  return prisma.vehicleScenario.update({
    where: { id },
    data,
  });
};

export const deleteVehicleScenario = async (tenantId: string, id: string): Promise<void> => {
  const prisma = createTenantPrismaClient(tenantId);
  const existingScenario = await prisma.vehicleScenario.findFirst({ where: { id, tenantId } });
  if (!existingScenario) {
    throw new Error("Vehicle scenario not found or access denied.");
  }
  await prisma.vehicleScenario.delete({ where: { id } });
};
