import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import * as userService from "./service";

export const getAllUsers = async (c: Context<AdminAuthEnv>) => {
  const { adminUser } = c.var;
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const users = await userService.getAllUsers(adminUser.tenantId);
  return c.json(users);
};

export const getUserById = async (c: Context<AdminAuthEnv>) => {
  const { adminUser } = c.var;
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const { id } = c.req.param();

  const user = await userService.getUserById(adminUser.tenantId, id);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  // A tenant should not be able to see users from another tenant.
  // The service logic already scopes this by tenantId, but as a safeguard:
  if (user.tenantId !== adminUser.tenantId) {
    throw new HTTPException(404, { message: "User not found" });
  }
  return c.json(user);
};
