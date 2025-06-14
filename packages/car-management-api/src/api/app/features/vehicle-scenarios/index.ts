import { Hono } from "hono";
import type { AppTenantEnv } from "../../middleware/tenant";
import { getAllVehicleScenarios, getVehicleScenarioById } from "./service";

const app = new Hono<AppTenantEnv>();

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const scenarios = await getAllVehicleScenarios(tenantId);
  return c.json(scenarios);
});

app.get("/:id", async (c) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const scenario = await getVehicleScenarioById(tenantId, id);
  if (scenario) {
    return c.json(scenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
});

export default app;
