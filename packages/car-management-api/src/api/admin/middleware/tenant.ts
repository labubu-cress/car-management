import { createMiddleware } from "hono/factory";

export const tenantMiddleware = createMiddleware(async (c, next) => {
  const tenantId = c.get("tenantId"); // This now comes from a higher-level middleware, initially as `unknown`
  if (typeof tenantId !== "string" || !tenantId) {
    return c.json({ message: "Tenant ID is invalid or not found" }, 401);
  }

  // Set the tenantId in the context with the correct type for downstream handlers
  c.set("tenantId", tenantId);

  await next();
});
