import type { AppEnv } from "@/types/hono";
import { Hono } from "hono";
import { getAllCarCategories, getCarCategoryById } from "./service";

const app = new Hono<AppEnv>();

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const categories = await getAllCarCategories(tenantId);
  return c.json(categories);
});

app.get("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const category = await getCarCategoryById(tenantId, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
});

export default app;
