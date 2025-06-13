import * as adminUserService from "@/modules/users/admin-user.service";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import type { CreateAdminUserInput, UpdateAdminUserInput } from "./schema";

type LoggedInUser = AdminAuthEnv["Variables"]["adminUser"];

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
  const adminUser = c.get("adminUser");
  try {
    const users = (await adminUserService.getAllAdminUsers()).filter((user) =>
      hasAdminManipulationPermission(adminUser, user),
    );
    return c.json(users);
  } catch (error) {
    throw new HTTPException(500, { message: "Error fetching admin users" });
  }
};

export const getAdminUserById = async (c: Context<AdminAuthEnv>) => {
  const adminUser = c.get("adminUser");
  const { id } = c.req.param();
  try {
    const user = await adminUserService.getAdminUserById(id);
    if (!user) {
      throw new HTTPException(404, { message: "Admin user not found" });
    }
    if (!hasAdminManipulationPermission(adminUser, user)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }
    return c.json(user);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Error fetching admin user" });
  }
};

export const createAdminUser = async (c: Context<AdminAuthEnv>) => {
  const adminUser = c.get("adminUser");
  const body = c.get("validatedData") as CreateAdminUserInput;

  if (!hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  try {
    const newUser = await adminUserService.createAdminUser(body);
    return c.json(newUser, 201);
  } catch (error) {
    throw new HTTPException(500, { message: "Error creating admin user" });
  }
};

export const updateAdminUser = async (c: Context<AdminAuthEnv>) => {
  const { id } = c.req.param();
  const adminUser = c.get("adminUser");
  const body = c.get("validatedData") as UpdateAdminUserInput;

  const targetUser = await adminUserService.getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser) || !hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  try {
    const updatedUser = await adminUserService.updateAdminUser(id, body);
    return c.json(updatedUser);
  } catch (error) {
    throw new HTTPException(500, { message: "Error updating admin user" });
  }
};

export const deleteAdminUser = async (c: Context<AdminAuthEnv>) => {
  const { id } = c.req.param();
  const adminUser = c.get("adminUser");

  const targetUser = await adminUserService.getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  try {
    await adminUserService.deleteAdminUser(id);
    return c.body(null, 204);
  } catch (error) {
    throw new HTTPException(500, { message: "Error deleting admin user" });
  }
};
