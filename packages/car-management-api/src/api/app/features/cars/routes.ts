import { Hono } from "hono";
import {
  getAllCarCategories,
  getAllCarTrims,
  getAllVehicleScenarios,
  getCarCategoryById,
  getCarTrimById,
  getVehicleScenarioById,
} from "./controller";

const carsAppRoutes = new Hono();

// All app routes related to cars will be defined and exported from here.

// VehicleScenario Routes
carsAppRoutes.get("/vehicle-scenarios", getAllVehicleScenarios);
carsAppRoutes.get("/vehicle-scenarios/:id", getVehicleScenarioById);

// CarCategory Routes
carsAppRoutes.get("/car-categories", getAllCarCategories);
carsAppRoutes.get("/car-categories/:id", getCarCategoryById);

// CarTrim Routes
carsAppRoutes.get("/car-categories/:categoryId/trims", getAllCarTrims);
carsAppRoutes.get("/car-trims/:id", getCarTrimById);

export default carsAppRoutes;
