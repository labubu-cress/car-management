import { prisma } from "@/lib/db";
import { Prisma, type Tenant } from "@prisma/client";

export const getAllTenants = async (): Promise<Tenant[]> => {
  return prisma.tenant.findMany();
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  return prisma.tenant.findUnique({ where: { id } });
};

export const createTenant = async (data: Prisma.TenantCreateInput): Promise<Tenant> => {
  return prisma.tenant.create({ data });
};

export const updateTenant = async (id: string, data: Prisma.TenantUpdateInput): Promise<Tenant | null> => {
  return prisma.tenant.update({ where: { id }, data });
};

export const deleteTenant = async (id: string): Promise<void> => {
  await prisma.tenant.delete({ where: { id } });
};
