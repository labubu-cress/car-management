import { z } from "zod";

export const adminRoleSchema = z.enum(["super_admin", "admin"]);

export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: adminRoleSchema,
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAdminUserSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
  role: adminRoleSchema,
  tenantId: z.string().optional(),
});

export const updateAdminUserSchema = z.object({
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  role: adminRoleSchema.optional(),
  tenantId: z.string().optional(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
