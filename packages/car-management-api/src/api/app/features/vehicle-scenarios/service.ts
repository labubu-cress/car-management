import { prisma } from "@/lib/db";
import { type VehicleScenario } from "@prisma/client";

export const getAllVehicleScenarios = async (tenantId: string): Promise<VehicleScenario[]> => {
  return prisma.vehicleScenario.findMany({ where: { tenantId } });
};

export const getVehicleScenarioById = async (tenantId: string, id: string): Promise<VehicleScenario | null> => {
  return prisma.vehicleScenario.findUnique({ where: { id, tenantId } });
};
