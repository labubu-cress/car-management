import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as userService from "../../../../modules/users/user.service";
import type { AdminAuthEnv } from "../../middleware/auth";

export const getAllUsers = async (c: Context<AdminAuthEnv>) => {
  const adminUser = c.get("adminUser");
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  try {
    const users = await userService.getAllUsers(adminUser.tenantId);
    return c.json(users);
  } catch (error) {
    throw new HTTPException(500, { message: "Error fetching users" });
  }
};

export const getUserById = async (c: Context<AdminAuthEnv>) => {
  const adminUser = c.get("adminUser");
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const { id } = c.req.param();

  try {
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
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Error fetching user" });
  }
};
