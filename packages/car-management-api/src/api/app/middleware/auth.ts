import { prisma } from '@/lib/db';
import type { User } from "@prisma/client";
import { type Context, type Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as appAuthService from "../features/auth/service";
import type { AppTenantEnv } from "./tenant";

// Define the shape of the JWT payload for app users
export interface AppJwtPayload {
  id: string;
  tenantId: string;
  openId: string;
}

// Define the shape of the environment for authenticated app routes
export type AppAuthEnv = {
  Variables: AppTenantEnv["Variables"] & {
    user: User;
  };
};

export const appAuthMiddleware = createMiddleware<AppAuthEnv>(async (c: Context<AppAuthEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const user = await appAuthService.verifyToken(token);

  if (!user) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!tenant) {
    throw new HTTPException(404, { message: "Tenant not found" });
  }

  c.set("user", user);
  c.set("tenant" as any, tenant);

  await next();
});
