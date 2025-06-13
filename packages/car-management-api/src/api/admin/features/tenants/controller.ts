import type { Context } from "hono";
import type { createTenantSchema, updateTenantSchema } from "./schema";
import * as tenantService from "./service";

export const getAllTenants = async (c: Context) => {
  // TODO: Add permission check middleware
  const tenants = await tenantService.getAllTenants();
  return c.json(tenants);
};

export const getTenantById = async (c: Context) => {
  // TODO: Add permission check middleware
  const { id } = c.req.param();
  const tenant = await tenantService.getTenantById(id);
  if (!tenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(tenant);
};

export const createTenant = async (c: Context) => {
  const validatedData = c.get("validatedData") as typeof createTenantSchema._type;
  const newTenant = await tenantService.createTenant(validatedData);
  return c.json(newTenant, 201);
};

export const updateTenant = async (c: Context) => {
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateTenantSchema._type;
  const updatedTenant = await tenantService.updateTenant(id, validatedData);
  if (!updatedTenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(updatedTenant);
};

export const deleteTenant = async (c: Context) => {
  const { id } = c.req.param();
  await tenantService.deleteTenant(id);
  return c.body(null, 204);
};
