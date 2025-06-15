import { prisma } from "@/lib/db";
import { z } from "zod";
import { tenantSchema, type CreateTenantInput, type Tenant, type UpdateTenantInput } from "./schema";

export const getAllTenants = async (): Promise<Tenant[]> => {
  const tenants = await prisma.tenant.findMany();
  return z.array(tenantSchema).parse(tenants);
};

export const getTenantById = async (id: string): Promise<Tenant | null> => {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    return null;
  }
  return tenantSchema.parse(tenant);
};

export const createTenant = async (data: CreateTenantInput): Promise<Tenant> => {
  const tenant = await prisma.tenant.create({ data });
  return tenantSchema.parse(tenant);
};

export const updateTenant = async (id: string, data: UpdateTenantInput): Promise<Tenant | null> => {
  const tenant = await prisma.tenant.update({ where: { id }, data });
  return tenantSchema.parse(tenant);
};

export const deleteTenant = async (id: string): Promise<void> => {
  await prisma.tenant.delete({ where: { id } });
};
