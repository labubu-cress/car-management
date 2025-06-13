import type { AppEnv } from "@/types/hono";
import type { Context } from "hono";
import * as Service from "./service";

export const getAllVehicleScenarios = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const scenarios = await Service.getAllVehicleScenarios(tenantId);
  return c.json(scenarios);
};

export const getVehicleScenarioById = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const scenario = await Service.getVehicleScenarioById(tenantId, id);
  if (scenario) {
    return c.json(scenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
};
