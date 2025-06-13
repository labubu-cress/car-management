import type { AppEnv } from "@/types/hono";
import { Hono } from "hono";
import { getAllCarTrims, getCarTrimById } from "./service";

const app = new Hono<{ Variables: AppEnv["Variables"] }>();

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

export default app;
