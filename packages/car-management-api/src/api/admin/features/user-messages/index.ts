import type { AdminAuthTenantEnv } from "@/api/admin/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserMessageQuerySchema } from "./schema";
import * as service from "./service";

const app = new Hono<AdminAuthTenantEnv>();

app.get("/", zValidator("query", UserMessageQuerySchema), async (c) => {
  const tenantId = c.get("tenantId");
  const query = c.req.valid("query");
  const { messages, total } = await service.find(tenantId, query);
  return c.json({
    items: messages,
    total,
  });
});

app.patch("/:id/process", async (c) => {
  const id = c.req.param("id");
  const adminUser = c.get("adminUser");
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  const result = await service.process(id, adminUser.id);
  return c.json(result);
});

export default app;
