import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import { ContactUsConfigUpdateSchema } from "./schema";
import { getContactUsConfig, upsertContactUsConfig } from "./service";

const factory = createFactory<AdminAuthTenantEnv>();

const checkWritePermission = factory.createMiddleware(async (c, next) => {
  if (c.var.adminUser?.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  await next();
});

const app = new Hono<AdminAuthTenantEnv>();

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const config = await getContactUsConfig(tenantId);
  if (!config) {
    return c.json(null);
  }
  return c.json(config);
});

app.put("/", checkWritePermission, zValidator("json", ContactUsConfigUpdateSchema), async (c) => {
  const { tenantId } = c.var;
  const data = c.req.valid("json");
  const config = await upsertContactUsConfig(tenantId, data);
  return c.json(config);
});

export default app;
