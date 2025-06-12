import { login } from "@/controllers/app/auth.controller";
import {
  getAllCarCategories,
  getAllCarTrims,
  getAllVehicleScenarios,
  getCarCategoryById,
  getCarTrimById,
  getVehicleScenarioById,
} from "@/controllers/app/car.controller";
import { getCurrentUser, updatePhoneNumber } from "@/controllers/app/user.controller";
import { authenticate } from "@/middleware/app/auth.middleware";
import { Router } from "express";

const router = Router();

// Auth Routes
// POST /api/app/auth/login - miniprogram user login
router.post("/auth/login", login);

// User Routes
router.get("/users/current", getCurrentUser);
router.post("/users/current/phone-number", updatePhoneNumber);

// Apply authentication middleware to all routes below
router.use(authenticate);

// VehicleScenario Routes
router.get("/vehicle-scenarios", getAllVehicleScenarios);
router.get("/vehicle-scenarios/:id", getVehicleScenarioById);

// CarCategory Routes;
router.get("/car-categories", getAllCarCategories);
router.get("/car-categories/:id", getCarCategoryById);

// CarTrim Routes
router.get("/car-categories/:categoryId/trims", getAllCarTrims);
router.get("/car-trims/:id", getCarTrimById);

export default router;
