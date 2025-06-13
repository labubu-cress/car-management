import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import type { AdminAuthEnv as BaseAdminAuthEnv } from "../../middleware/auth";
import { createAdminUserSchema, updateAdminUserSchema } from "./schema";
import * as adminUserService from "./service";

export type AdminAuthEnv = BaseAdminAuthEnv;
type LoggedInUser = AdminAuthEnv["Variables"]["adminUser"];

type ValidatedContext<T extends z.ZodSchema> = Context<
  AdminAuthEnv,
  any,
  {
    in: { json: z.infer<T> };
    out: { json: z.infer<T> };
  }
>;

const hasAdminManipulationPermission = (user: LoggedInUser, targetUser: Partial<LoggedInUser>): boolean => {
  switch (user.role) {
    case "super_admin":
      return true;
    case "admin":
      return targetUser.role !== "super_admin";
    case "tenant_admin":
      return targetUser.role !== "super_admin" && targetUser.role !== "admin" && targetUser.tenantId === user.tenantId;
    case "tenant_viewer":
      return false;
    default:
      return false;
  }
};

export const getAllAdminUsers = async (c: Context<AdminAuthEnv>) => {
  const { adminUser } = c.var;
  const users = (await adminUserService.getAllAdminUsers()).filter((user) =>
    hasAdminManipulationPermission(adminUser, user),
  );
  return c.json(users);
};

export const getAdminUserById = async (c: Context<AdminAuthEnv>) => {
  const { adminUser } = c.var;
  const { id } = c.req.param();
  const user = await adminUserService.getAdminUserById(id);
  if (!user) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }
  if (!hasAdminManipulationPermission(adminUser, user)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  return c.json(user);
};

export const createAdminUser = async (c: ValidatedContext<typeof createAdminUserSchema>) => {
  const { adminUser } = c.var;
  const body = c.req.valid("json");

  if (!hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  const newUser = await adminUserService.createAdminUser(body);
  return c.json(newUser, 201);
};

export const updateAdminUser = async (c: ValidatedContext<typeof updateAdminUserSchema>) => {
  const { id } = c.req.param();
  const { adminUser } = c.var;
  const body = c.req.valid("json");

  const targetUser = await adminUserService.getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser) || !hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const updatedUser = await adminUserService.updateAdminUser(id, body);
  return c.json(updatedUser);
};

export const deleteAdminUser = async (c: Context<AdminAuthEnv>) => {
  const { id } = c.req.param();
  const { adminUser } = c.var;

  const targetUser = await adminUserService.getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await adminUserService.deleteAdminUser(id);
  return c.body(null, 204);
};
