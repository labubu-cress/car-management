// Controllers for car-related App APIs will be defined here.
// These controllers will use services from the 'modules/cars' directory.

import type { Context } from "hono";
import * as carsService from "./service";

// VehicleScenario Controllers
export const getAllVehicleScenarios = async (c: Context) => {
  const tenantId = c.get("tenantId");
  try {
    const scenarios = await carsService.getAllVehicleScenarios(tenantId);
    return c.json(scenarios);
  } catch (error: any) {
    return c.json({ message: "Error fetching vehicle scenarios", error: error.message }, 500);
  }
};

export const getVehicleScenarioById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    const scenario = await carsService.getVehicleScenarioById(tenantId, id);
    if (scenario) {
      return c.json(scenario);
    }
    return c.json({ message: "Vehicle scenario not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error fetching vehicle scenario", error: error.message }, 500);
  }
};

// CarCategory Controllers
export const getAllCarCategories = async (c: Context) => {
  const tenantId = c.get("tenantId");
  try {
    const categories = await carsService.getAllCarCategories(tenantId);
    return c.json(categories);
  } catch (error: any) {
    return c.json({ message: "Error fetching car categories", error: error.message }, 500);
  }
};

export const getCarCategoryById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    const category = await carsService.getCarCategoryById(tenantId, id);
    if (category) {
      return c.json(category);
    }
    return c.json({ message: "Car category not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error fetching car category", error: error.message }, 500);
  }
};

// CarTrim Controllers
export const getAllCarTrims = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  try {
    const trims = await carsService.getAllCarTrims(tenantId, categoryId);
    return c.json(trims);
  } catch (error: any) {
    return c.json({ message: "Error fetching car trims", error: error.message }, 500);
  }
};

export const getCarTrimById = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    const trim = await carsService.getCarTrimById(tenantId, id);
    if (trim) {
      return c.json(trim);
    }
    return c.json({ message: "Car trim not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error fetching car trim", error: error.message }, 500);
  }
};
