import type { Context } from "hono";
import type { z } from "zod";
import type { AdminAuthEnv } from "../../middleware/auth";
import type { createTenantSchema, updateTenantSchema } from "./schema";
import * as tenantService from "./service";

type ValidatedContext<T extends z.ZodSchema> = Context<
  AdminAuthEnv,
  any,
  {
    in: { json: z.infer<T> };
    out: { json: z.infer<T> };
  }
>;

export const getAllTenants = async (c: Context<AdminAuthEnv>) => {
  // TODO: Add permission check middleware
  const tenants = await tenantService.getAllTenants();
  return c.json(tenants);
};

export const getTenantById = async (c: Context<AdminAuthEnv>) => {
  // TODO: Add permission check middleware
  const { id } = c.req.param();
  const tenant = await tenantService.getTenantById(id);
  if (!tenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(tenant);
};

export const createTenant = async (c: ValidatedContext<typeof createTenantSchema>) => {
  const validatedData = c.req.valid("json");
  const newTenant = await tenantService.createTenant(validatedData);
  return c.json(newTenant, 201);
};

export const updateTenant = async (c: ValidatedContext<typeof updateTenantSchema>) => {
  const { id } = c.req.param();
  const validatedData = c.req.valid("json");
  const updatedTenant = await tenantService.updateTenant(id, validatedData);
  if (!updatedTenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(updatedTenant);
};

export const deleteTenant = async (c: Context<AdminAuthEnv>) => {
  const { id } = c.req.param();
  await tenantService.deleteTenant(id);
  return c.body(null, 204);
};
