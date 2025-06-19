import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import {
  createCarCategorySchema,
  getCarCategoriesSchema,
  reorderCarCategoriesSchema,
  updateCarCategorySchema,
} from "./schema";
import {
  createCarCategory,
  deleteCarCategory,
  getAllCarCategories,
  getCarCategoryById,
  reorderCarCategories,
  updateCarCategory,
} from "./service";

const app = new Hono<AdminAuthTenantEnv>();

// Middleware to check for tenantId
app.use("*", async (c, next) => {
  if (!c.var.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  await next();
});

app.post("/", zValidator("json", createCarCategorySchema), async (c) => {
  const { tenantId } = c.var;
  const body = c.req.valid("json");
  const newCategory = await createCarCategory(tenantId as string, body);
  return c.json(newCategory, 201);
});

app.get("/", zValidator("query", getCarCategoriesSchema), async (c) => {
  const { tenantId } = c.var;
  const { name, vehicleScenarioId } = c.req.valid("query");
  const categories = await getAllCarCategories(tenantId as string, name, vehicleScenarioId);
  return c.json(categories);
});

app.get("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const category = await getCarCategoryById(tenantId as string, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
});

app.put("/reorder", zValidator("json", reorderCarCategoriesSchema), async (c) => {
  const { tenantId } = c.var;
  const { vehicleScenarioId, categoryIds } = c.req.valid("json");
  await reorderCarCategories(tenantId as string, vehicleScenarioId, categoryIds);
  return c.body(null, 204);
});

app.put("/:id", zValidator("json", updateCarCategorySchema), async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const body = c.req.valid("json");

  const updatedCategory = await updateCarCategory(tenantId as string, id, body);
  if (updatedCategory) {
    return c.json(updatedCategory);
  }
  return c.json({ message: "Car category not found" }, 404);
});

app.delete("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  await deleteCarCategory(tenantId as string, id);
  return c.body(null, 204);
});

export default app;
