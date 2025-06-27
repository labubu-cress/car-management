import type { AdminAuthTenantEnv } from "@/api/admin/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { UserMessageQuerySchema } from "./schema";
import * as service from "./service";

const app = new Hono<AdminAuthTenantEnv>();

const checkWritePermission = createMiddleware<AdminAuthTenantEnv>(async (c, next) => {
  const { adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  await next();
});

app.get("/", zValidator("query", UserMessageQuerySchema), async (c) => {
  const tenantId = c.get("tenantId");
  const query = c.req.valid("query");
  const { messages, total } = await service.find(tenantId, query);
  return c.json({
    items: messages,
    total,
  });
});

app.patch("/:id/process", checkWritePermission, async (c) => {
  const id = c.req.param("id");
  const adminUser = c.get("adminUser");
  const result = await service.process(id, adminUser.id);
  return c.json(result);
});

export default app;
