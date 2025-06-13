// Controllers for car-related App APIs will be defined here.
// These controllers will use services from the 'modules/cars' directory.

import type { Context } from "hono";
import * as carsService from "./service";

// VehicleScenario Controllers
export const getAllVehicleScenarios = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const scenarios = await carsService.getAllVehicleScenarios(tenantId);
  return c.json(scenarios);
};

export const getVehicleScenarioById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const scenario = await carsService.getVehicleScenarioById(tenantId, id);
  if (scenario) {
    return c.json(scenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
};

// CarCategory Controllers
export const getAllCarCategories = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const categories = await carsService.getAllCarCategories(tenantId);
  return c.json(categories);
};

export const getCarCategoryById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const category = await carsService.getCarCategoryById(tenantId, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
};

// CarTrim Controllers
export const getAllCarTrims = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  const trims = await carsService.getAllCarTrims(tenantId, categoryId);
  return c.json(trims);
};

export const getCarTrimById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const trim = await carsService.getCarTrimById(tenantId, id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};
