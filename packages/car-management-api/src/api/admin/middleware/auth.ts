import type { AdminUser } from "@prisma/client";
import { type Context, type Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as authService from "../features/auth/service";

// Define the shape of the JWT payload for admin users
export interface AdminJwtPayload {
  id: string;
}

// Define the shape of the environment for authenticated admin routes
export type AdminAuthEnv = {
  Variables: {
    adminUser: Omit<AdminUser, "passwordHash">;
  };
};

async function handleAdminAuth<E extends AdminAuthEnv>(c: Context<E>) {
  const authHeader = c.req.header("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new HTTPException(401, { message: "No token provided" });
  }

  const adminUser = await authService.verifyToken(token);

  if (!adminUser) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  c.set("adminUser", adminUser);
  return adminUser;
}

export const authMiddleware = createMiddleware<AdminAuthEnv>(async (c, next: Next) => {
  await handleAdminAuth(c);
  await next();
});

export type AdminAuthTenantEnv = AdminAuthEnv & {
  Variables: {
    tenantId: string;
  };
};

export const superAdminMiddleware = createMiddleware<AdminAuthEnv>(async (c, next:Next) => {
  const adminUser = await handleAdminAuth(c);
  if (adminUser.role !== "super_admin") {
    throw new HTTPException(401, { message: "Role not match" });
  }
  await next();
})

export const tenantAccessMiddleware = createMiddleware<AdminAuthTenantEnv>(async (c, next) => {
  const adminUser = await handleAdminAuth(c);
  const tenantId = c.req.param("tenantId");

  if (!tenantId) {
    throw new HTTPException(400, { message: "Tenant ID is required in the URL path." });
  }

  if (adminUser.tenantId && adminUser.tenantId !== tenantId) {
    throw new HTTPException(403, { message: "You are not authorized to access this tenant." });
  }

  c.set("tenantId", tenantId);
  await next();
});