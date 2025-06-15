import { z } from "zod";

export const tenantStatusSchema = z.enum(["active", "inactive"]);

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  appId: z.string(),
  appSecret: z.string(),
  status: tenantStatusSchema,
  config: z.record(z.string(), z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  status: tenantStatusSchema.optional(),
  config: z.record(z.string(), z.any()).optional().default({}),
});

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  appId: z.string().min(1).optional(),
  appSecret: z.string().min(1).optional(),
  status: tenantStatusSchema.optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export type Tenant = z.infer<typeof tenantSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
