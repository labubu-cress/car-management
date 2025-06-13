import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import type {
  CreateCarCategoryInput,
  CreateCarTrimInput,
  CreateVehicleScenarioInput,
  UpdateCarCategoryInput,
  UpdateCarTrimInput,
  UpdateVehicleScenarioInput,
} from "./schema";
import * as Service from "./service";

type ControllerEnv<T = unknown> = AdminAuthEnv & {
  Variables: {
    validatedData: T;
  };
};

// Controllers for car-related admin APIs will be defined here.
// These controllers will use services from the 'modules/cars' directory.

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

export const createCarCategory = async (c: Context<ControllerEnv<CreateCarCategoryInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const newCategory = await Service.createCarCategory(tenantId, validatedData);
  return c.json(newCategory, 201);
};

export const getAllCarCategories = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const categories = await Service.getAllCarCategories(tenantId);
  return c.json(categories);
};

export const getCarCategoryById = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  const category = await Service.getCarCategoryById(tenantId, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
};

export const updateCarCategory = async (c: Context<ControllerEnv<UpdateCarCategoryInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();

  const updatedCategory = await Service.updateCarCategory(tenantId, id, validatedData);
  if (updatedCategory) {
    return c.json(updatedCategory);
  }
  return c.json({ message: "Car category not found" }, 404);
};

export const deleteCarCategory = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  await Service.deleteCarCategory(tenantId, id);
  return c.body(null, 204);
};

export const createCarTrim = async (c: Context<ControllerEnv<CreateCarTrimInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const newTrim = await Service.createCarTrim(tenantId, validatedData);
  return c.json(newTrim, 201);
};

export const getAllCarTrims = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { categoryId } = c.req.param();
  if (!categoryId) {
    return c.json({ message: "categoryId parameter is required" }, 400);
  }
  const trims = await Service.getAllCarTrims(tenantId, categoryId);
  return c.json(trims);
};

export const getCarTrimById = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  const trim = await Service.getCarTrimById(tenantId, id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};

export const updateCarTrim = async (c: Context<ControllerEnv<UpdateCarTrimInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();

  const updatedTrim = await Service.updateCarTrim(tenantId, id, validatedData);
  if (updatedTrim) {
    return c.json(updatedTrim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};

export const deleteCarTrim = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  await Service.deleteCarTrim(tenantId, id);
  return c.body(null, 204);
};
