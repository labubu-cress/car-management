import { zodValidator } from "@hono/zod-validator";
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
carsAdminRoutes.post("/vehicle-scenarios", zodValidator("json", createVehicleScenarioSchema), createVehicleScenario);
carsAdminRoutes.get("/vehicle-scenarios", getAllVehicleScenarios);
carsAdminRoutes.get("/vehicle-scenarios/:id", getVehicleScenarioById);
carsAdminRoutes.put("/vehicle-scenarios/:id", zodValidator("json", updateVehicleScenarioSchema), updateVehicleScenario);
carsAdminRoutes.delete("/vehicle-scenarios/:id", deleteVehicleScenario);

// CarCategory Routes
carsAdminRoutes.post("/car-categories", zodValidator("json", createCarCategorySchema), createCarCategory);
carsAdminRoutes.get("/car-categories", getAllCarCategories);
carsAdminRoutes.get("/car-categories/:id", getCarCategoryById);
carsAdminRoutes.put("/car-categories/:id", zodValidator("json", updateCarCategorySchema), updateCarCategory);
carsAdminRoutes.delete("/car-categories/:id", deleteCarCategory);

// CarTrim Routes
carsAdminRoutes.post("/car-categories/:categoryId/trims", zodValidator("json", createCarTrimSchema), createCarTrim);
carsAdminRoutes.get("/car-categories/:categoryId/trims", getAllCarTrims);
carsAdminRoutes.get("/car-trims/:id", getCarTrimById);
carsAdminRoutes.put("/car-trims/:id", zodValidator("json", updateCarTrimSchema), updateCarTrim);
carsAdminRoutes.delete("/car-trims/:id", deleteCarTrim);

export default carsAdminRoutes;
