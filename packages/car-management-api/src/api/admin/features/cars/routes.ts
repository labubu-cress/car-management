import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createCarCategory,
  createCarTrim,
  createVehicleScenario,
  deleteCarCategory,
  deleteCarTrim,
  deleteVehicleScenario,
  getAllCarCategories,
  getAllCarTrims,
  getAllVehicleScenarios,
  getCarCategoryById,
  getCarTrimById,
  getVehicleScenarioById,
  updateCarCategory,
  updateCarTrim,
  updateVehicleScenario,
} from "./controller";
import {
  createCarCategorySchema,
  createCarTrimSchema,
  createVehicleScenarioSchema,
  updateCarCategorySchema,
  updateCarTrimSchema,
  updateVehicleScenarioSchema,
} from "./schema";

const carsAdminRoutes = new Hono();

// VehicleScenario Routes
carsAdminRoutes.post("/vehicle-scenarios", zValidator("json", createVehicleScenarioSchema), createVehicleScenario);
carsAdminRoutes.get("/vehicle-scenarios", getAllVehicleScenarios);
carsAdminRoutes.get("/vehicle-scenarios/:id", getVehicleScenarioById);
carsAdminRoutes.put("/vehicle-scenarios/:id", zValidator("json", updateVehicleScenarioSchema), updateVehicleScenario);
carsAdminRoutes.delete("/vehicle-scenarios/:id", deleteVehicleScenario);

// CarCategory Routes
carsAdminRoutes.post("/car-categories", zValidator("json", createCarCategorySchema), createCarCategory);
carsAdminRoutes.get("/car-categories", getAllCarCategories);
carsAdminRoutes.get("/car-categories/:id", getCarCategoryById);
carsAdminRoutes.put("/car-categories/:id", zValidator("json", updateCarCategorySchema), updateCarCategory);
carsAdminRoutes.delete("/car-categories/:id", deleteCarCategory);

// CarTrim Routes
carsAdminRoutes.post("/car-categories/:categoryId/trims", zValidator("json", createCarTrimSchema), createCarTrim);
carsAdminRoutes.get("/car-categories/:categoryId/trims", getAllCarTrims);
carsAdminRoutes.get("/car-trims/:id", getCarTrimById);
carsAdminRoutes.put("/car-trims/:id", zValidator("json", updateCarTrimSchema), updateCarTrim);
carsAdminRoutes.delete("/car-trims/:id", deleteCarTrim);

export default carsAdminRoutes;
