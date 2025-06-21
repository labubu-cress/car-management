import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AdminAuthEnv } from "../../middleware/auth";
import { superAdminMiddleware } from "../../middleware/auth";
import { createTenantSchema, updateTenantSchema } from "./schema";
import { createTenant, deleteTenant, getAllTenants, getTenantById, updateTenant } from "./service";

const app = new Hono<AdminAuthEnv>();

app.get("/", async (c) => {
  const tenants = await getAllTenants();
  return c.json(tenants);
});

app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const tenant = await getTenantById(id);
  if (!tenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(tenant);
});

app.post("/", superAdminMiddleware, zValidator("json", createTenantSchema), async (c) => {
  const body = c.req.valid("json");
  const newTenant = await createTenant(body);
  return c.json(newTenant, 201);
});

app.put("/:id", superAdminMiddleware, zValidator("json", updateTenantSchema), async (c) => {
  const { id } = c.req.param();
  const body = c.req.valid("json");
  const updatedTenant = await updateTenant(id, body);
  if (!updatedTenant) {
    return c.json({ message: "Tenant not found" }, 404);
  }
  return c.json(updatedTenant);
});

app.delete("/:id", superAdminMiddleware, async (c) => {
  const { id } = c.req.param();
  await deleteTenant(id);
  return c.body(null, 204);
});

export default app;
