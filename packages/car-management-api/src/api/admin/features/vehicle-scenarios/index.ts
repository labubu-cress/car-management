import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import { createVehicleScenarioSchema, updateVehicleScenarioSchema } from "./schema";
import {
  createVehicleScenario,
  deleteVehicleScenario,
  getAllVehicleScenarios,
  getVehicleScenarioById,
  updateVehicleScenario,
} from "./service";

const app = new Hono<AdminAuthTenantEnv>();

// Middleware to check for tenantId
app.use("*", async (c, next) => {
  if (!c.var.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  await next();
});

app.post("/", zValidator("json", createVehicleScenarioSchema), async (c) => {
  const { tenantId, adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  const body = c.req.valid("json");
  const newScenario = await createVehicleScenario(tenantId as string, body);
  return c.json(newScenario, 201);
});

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const scenarios = await getAllVehicleScenarios(tenantId as string);
  return c.json(scenarios);
});

app.get("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const scenario = await getVehicleScenarioById(tenantId as string, id);
  if (scenario) {
    return c.json(scenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
});

app.put("/:id", zValidator("json", updateVehicleScenarioSchema), async (c) => {
  const { tenantId, adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  const { id } = c.req.param();
  const body = c.req.valid("json");

  const updatedScenario = await updateVehicleScenario(tenantId as string, id, body);
  if (updatedScenario) {
    return c.json(updatedScenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
});

app.delete("/:id", async (c) => {
  const { tenantId, adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  const { id } = c.req.param();
  await deleteVehicleScenario(tenantId as string, id);
  return c.body(null, 204);
});

export default app;
