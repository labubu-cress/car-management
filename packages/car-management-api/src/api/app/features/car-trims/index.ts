import { Hono } from "hono";
import { type OptionalAppAuthEnv, optionalAppAuthMiddleware } from "../../middleware/auth";
import { getAllCarTrims, getCarTrimById } from "./service";

const app = new Hono<OptionalAppAuthEnv>();

app.use("*", optionalAppAuthMiddleware);

app.get("/", async (c) => {
  const { tenantId, user } = c.var;
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  const trims = await getAllCarTrims(tenantId, categoryId, user?.id);
  return c.json(trims);
});

app.get("/:id", async (c) => {
  const { tenantId, user } = c.var;
  const { id } = c.req.param();
  const trim = await getCarTrimById(tenantId, id, user?.id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
});

export default app;
