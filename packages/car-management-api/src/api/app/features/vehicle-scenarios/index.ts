import type { AppEnv } from "@/types/hono";
import { Hono } from "hono";
import { getAllVehicleScenarios, getVehicleScenarioById } from "./service";

const app = new Hono<AppEnv>();

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
