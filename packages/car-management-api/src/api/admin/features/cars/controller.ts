import * as carsService from "@/modules/cars/cars.service";
import type { Context } from "hono";
import type {
  createCarCategorySchema,
  createCarTrimSchema,
  createVehicleScenarioSchema,
  updateCarCategorySchema,
  updateCarTrimSchema,
  updateVehicleScenarioSchema,
} from "./schema";

// Controllers for car-related admin APIs will be defined here.
// These controllers will use services from the 'modules/cars' directory.

export const createVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const validatedData = c.get("validatedData") as typeof createVehicleScenarioSchema._type;

  try {
    const newScenario = await carsService.createVehicleScenario(tenantId, validatedData);
    return c.json(newScenario, 201);
  } catch (error: any) {
    return c.json({ message: "Error creating vehicle scenario", error: error.message }, 500);
  }
};

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

export const updateVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateVehicleScenarioSchema._type;

  try {
    const updatedScenario = await carsService.updateVehicleScenario(tenantId, id, validatedData);
    if (updatedScenario) {
      return c.json(updatedScenario);
    }
    return c.json({ message: "Vehicle scenario not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error updating vehicle scenario", error: error.message }, 500);
  }
};

export const deleteVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    await carsService.deleteVehicleScenario(tenantId, id);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ message: "Error deleting vehicle scenario", error: error.message }, 500);
  }
};

export const createCarCategory = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const validatedData = c.get("validatedData") as typeof createCarCategorySchema._type;

  // Ensure JSON fields are not undefined
  const dataForPrisma = {
    ...validatedData,
    tags: validatedData.tags ?? [],
    highlights: validatedData.highlights ?? [],
    interiorImages: validatedData.interiorImages ?? [],
    exteriorImages: validatedData.exteriorImages ?? [],
    offerPictures: validatedData.offerPictures ?? [],
  };

  try {
    const newCategory = await carsService.createCarCategory(tenantId, dataForPrisma);
    return c.json(newCategory, 201);
  } catch (error: any) {
    return c.json({ message: "Error creating car category", error: error.message }, 500);
  }
};

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

export const updateCarCategory = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateCarCategorySchema._type;

  const dataForPrisma = { ...validatedData };
  // Remove undefined json fields to avoid Prisma errors
  if (dataForPrisma.tags === undefined) delete dataForPrisma.tags;
  if (dataForPrisma.highlights === undefined) delete dataForPrisma.highlights;
  if (dataForPrisma.interiorImages === undefined) delete dataForPrisma.interiorImages;
  if (dataForPrisma.exteriorImages === undefined) delete dataForPrisma.exteriorImages;
  if (dataForPrisma.offerPictures === undefined) delete dataForPrisma.offerPictures;

  try {
    const updatedCategory = await carsService.updateCarCategory(tenantId, id, dataForPrisma);
    if (updatedCategory) {
      return c.json(updatedCategory);
    }
    return c.json({ message: "Car category not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error updating car category", error: error.message }, 500);
  }
};

export const deleteCarCategory = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    await carsService.deleteCarCategory(tenantId, id);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ message: "Error deleting car category", error: error.message }, 500);
  }
};

export const createCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const validatedData = c.get("validatedData") as typeof createCarTrimSchema._type;

  const dataForPrisma = {
    ...validatedData,
    features: validatedData.features ?? [],
  };

  try {
    const newTrim = await carsService.createCarTrim(tenantId, dataForPrisma);
    return c.json(newTrim, 201);
  } catch (error: any) {
    return c.json({ message: "Error creating car trim", error: error.message }, 500);
  }
};

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

export const updateCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateCarTrimSchema._type;

  const dataForPrisma = { ...validatedData };
  if (dataForPrisma.features === undefined) delete dataForPrisma.features;

  try {
    const updatedTrim = await carsService.updateCarTrim(tenantId, id, dataForPrisma);
    if (updatedTrim) {
      return c.json(updatedTrim);
    }
    return c.json({ message: "Car trim not found" }, 404);
  } catch (error: any) {
    return c.json({ message: "Error updating car trim", error: error.message }, 500);
  }
};

export const deleteCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  try {
    await carsService.deleteCarTrim(tenantId, id);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ message: "Error deleting car trim", error: error.message }, 500);
  }
};
