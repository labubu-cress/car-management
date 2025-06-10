import { VehicleScenario, Prisma } from '@prisma/client';
import { createTenantPrismaClient } from '../db/client';

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findMany();
};

export const getVehicleScenarioById = async (tenantId: string, id: string): Promise<VehicleScenario | null> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.findUnique({ where: { id } });
};

export const createVehicleScenario = async (tenantId: string, data: Prisma.VehicleScenarioCreateInput): Promise<VehicleScenario> => {
  const prisma = createTenantPrismaClient(tenantId);
  return prisma.vehicleScenario.create({ data });
};

export const updateVehicleScenario = async (tenantId: string, id: string, data: Prisma.VehicleScenarioUpdateInput): Promise<VehicleScenario | null> => {
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