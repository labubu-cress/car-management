import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../../middleware/auth";
import type { CreateVehicleScenarioInput, UpdateVehicleScenarioInput } from "./schema";
import * as Service from "./service";

type ControllerEnv<T = unknown> = AdminAuthEnv & {
  Variables: {
    validatedData: T;
  };
};

export const createVehicleScenario = async (c: Context<ControllerEnv<CreateVehicleScenarioInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const newScenario = await Service.createVehicleScenario(tenantId, validatedData);
  return c.json(newScenario, 201);
};

export const getAllVehicleScenarios = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const scenarios = await Service.getAllVehicleScenarios(tenantId);
  return c.json(scenarios);
};

export const getVehicleScenarioById = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  const scenario = await Service.getVehicleScenarioById(tenantId, id);
  if (scenario) {
    return c.json(scenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
};

export const updateVehicleScenario = async (c: Context<ControllerEnv<UpdateVehicleScenarioInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();

  const updatedScenario = await Service.updateVehicleScenario(tenantId, id, validatedData);
  if (updatedScenario) {
    return c.json(updatedScenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
};

export const deleteVehicleScenario = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  await Service.deleteVehicleScenario(tenantId, id);
  return c.body(null, 204);
};
