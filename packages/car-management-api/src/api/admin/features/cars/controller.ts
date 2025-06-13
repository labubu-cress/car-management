import type { Context } from "hono";
import type {
  createCarCategorySchema,
  createCarTrimSchema,
  createVehicleScenarioSchema,
  updateCarCategorySchema,
  updateCarTrimSchema,
  updateVehicleScenarioSchema,
} from "./schema";
import * as carsService from "./service";

// Controllers for car-related admin APIs will be defined here.
// These controllers will use services from the 'modules/cars' directory.

export const createVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const validatedData = c.get("validatedData") as typeof createVehicleScenarioSchema._type;

  const newScenario = await carsService.createVehicleScenario(tenantId, validatedData);
  return c.json(newScenario, 201);
};

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

export const updateVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateVehicleScenarioSchema._type;

  const updatedScenario = await carsService.updateVehicleScenario(tenantId, id, validatedData);
  if (updatedScenario) {
    return c.json(updatedScenario);
  }
  return c.json({ message: "Vehicle scenario not found" }, 404);
};

export const deleteVehicleScenario = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  await carsService.deleteVehicleScenario(tenantId, id);
  return c.body(null, 204);
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

  const newCategory = await carsService.createCarCategory(tenantId, dataForPrisma);
  return c.json(newCategory, 201);
};

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

  const updatedCategory = await carsService.updateCarCategory(tenantId, id, dataForPrisma);
  if (updatedCategory) {
    return c.json(updatedCategory);
  }
  return c.json({ message: "Car category not found" }, 404);
};

export const deleteCarCategory = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  await carsService.deleteCarCategory(tenantId, id);
  return c.body(null, 204);
};

export const createCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const validatedData = c.get("validatedData") as typeof createCarTrimSchema._type;

  const dataForPrisma = {
    ...validatedData,
    features: validatedData.features ?? [],
  };

  const newTrim = await carsService.createCarTrim(tenantId, dataForPrisma);
  return c.json(newTrim, 201);
};

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

export const updateCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  const validatedData = c.get("validatedData") as typeof updateCarTrimSchema._type;

  const dataForPrisma = { ...validatedData };
  if (dataForPrisma.features === undefined) delete dataForPrisma.features;

  const updatedTrim = await carsService.updateCarTrim(tenantId, id, dataForPrisma);
  if (updatedTrim) {
    return c.json(updatedTrim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};

export const deleteCarTrim = async (c: Context) => {
  const tenantId = c.get("tenantId");
  const { id } = c.req.param();
  await carsService.deleteCarTrim(tenantId, id);
  return c.body(null, 204);
};
