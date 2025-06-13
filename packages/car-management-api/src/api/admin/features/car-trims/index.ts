import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import { createCarTrimSchema, updateCarTrimSchema } from "./schema";
import { createCarTrim, deleteCarTrim, getAllCarTrims, getCarTrimById, updateCarTrim } from "./service";

const app = new Hono<{ Variables: AdminAuthEnv["Variables"] }>();

// Middleware to check for tenantId
app.use("*", async (c, next) => {
  if (!c.var.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  await next();
});

app.post("/", zValidator("json", createCarTrimSchema), async (c) => {
  const { tenantId } = c.var;
  const body = c.req.valid("json");
  const newTrim = await createCarTrim(tenantId as string, body);
  return c.json(newTrim, 201);
});

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  const trims = await getAllCarTrims(tenantId as string, categoryId);
  return c.json(trims);
});

app.get("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const trim = await getCarTrimById(tenantId as string, id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
});

app.put("/:id", zValidator("json", updateCarTrimSchema), async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const body = c.req.valid("json");

  const updatedTrim = await updateCarTrim(tenantId as string, id, body);
  if (updatedTrim) {
    return c.json(updatedTrim);
  }
  return c.json({ message: "Car trim not found" }, 404);
});

app.delete("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  await deleteCarTrim(tenantId as string, id);
  return c.body(null, 204);
});

export default app;
