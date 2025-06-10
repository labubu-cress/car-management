import { PrismaClient, VehicleScenario, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  return prisma.vehicleScenario.findMany({ where: { tenantId } });
};

export const getVehicleScenarioById = async (id: string): Promise<VehicleScenario | null> => {
  return prisma.vehicleScenario.findUnique({ where: { id } });
};

export const createVehicleScenario = async (data: Prisma.VehicleScenarioCreateInput): Promise<VehicleScenario> => {
  return prisma.vehicleScenario.create({ data });
};

export const updateVehicleScenario = async (id: string, data: Prisma.VehicleScenarioUpdateInput): Promise<VehicleScenario | null> => {
  return prisma.vehicleScenario.update({
    where: { id },
    data,
  });
};

export const deleteVehicleScenario = async (id: string): Promise<void> => {
  await prisma.vehicleScenario.delete({ where: { id } });
}; 