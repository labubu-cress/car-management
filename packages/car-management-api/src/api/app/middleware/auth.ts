import type { User } from "@prisma/client";
import { type Context, type Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as appAuthService from "../features/auth/service";

// Define the shape of the JWT payload for app users
export interface AppJwtPayload {
  id: string;
  tenantId: string;
  openId: string;
}

// Define the shape of the environment for authenticated app routes
export type AppAuthEnv = {
  Variables: {
    user: User;
    tenantId: string;
  };
};

export const appAuthMiddleware = createMiddleware<AppAuthEnv>(async (c: Context<AppAuthEnv>, next: Next) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new HTTPException(401, { message: "No token provided" });
  }

  const user = await appAuthService.verifyToken(token);

  if (!user) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  
  if (user.tenantId !== c.var.tenantId) {
    throw new HTTPException(403, { message: "You are not authorized to access this tenant." });
  }
  c.set("user", user);

  await next();
});
