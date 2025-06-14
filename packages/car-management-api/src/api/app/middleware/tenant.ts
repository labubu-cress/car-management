import { createMiddleware } from "hono/factory";

export type AppTenantEnv = {
  Variables: {
    tenantId: string;
  };
};
export const tenantMiddleware = createMiddleware(async (c, next) => {
  const tenantId = c.req.param("tenantId");
  if (typeof tenantId !== "string" || !tenantId) {
    return c.json({ message: "Tenant ID is invalid or not found" }, 401);
  }

  // Set the tenantId in the context with the correct type for downstream handlers
  c.set("tenantId", tenantId);

  await next();
});
