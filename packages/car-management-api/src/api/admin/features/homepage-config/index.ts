import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import { HomepageConfigUpdateSchema } from "./schema";
import { getHomepageConfig, upsertHomepageConfig } from "./service";

const app = new Hono<AdminAuthTenantEnv>();

const checkWritePermission = createMiddleware<AdminAuthTenantEnv>(async (c, next) => {
  const { adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  await next();
});

app.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const config = await getHomepageConfig(tenantId);
  if (!config) {
    return c.json(null);
  }
  return c.json(config);
});

app.put("/", checkWritePermission, zValidator("json", HomepageConfigUpdateSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const data = c.req.valid("json");
  const config = await upsertHomepageConfig(tenantId, data);
  return c.json(config);
});

export default app;
