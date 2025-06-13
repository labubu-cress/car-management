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
    tenantId?: string; // tenantId is optional
  };
};

export const authMiddleware = createMiddleware<AdminAuthEnv>(async (c: Context<AdminAuthEnv>, next: Next) => {
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
  if (adminUser.tenantId) {
    c.set("tenantId", adminUser.tenantId);
  }

  await next();
});
