import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createVehicleScenario,
  deleteVehicleScenario,
  getAllVehicleScenarios,
  getVehicleScenarioById,
  updateVehicleScenario,
} from "./controller";
import { createVehicleScenarioSchema, updateVehicleScenarioSchema } from "./schema";

const vehicleScenariosAdminRoutes = new Hono();

// VehicleScenario Routes
vehicleScenariosAdminRoutes.post("/", zValidator("json", createVehicleScenarioSchema), createVehicleScenario);
vehicleScenariosAdminRoutes.get("/", getAllVehicleScenarios);
vehicleScenariosAdminRoutes.get("/:id", getVehicleScenarioById);
vehicleScenariosAdminRoutes.put("/:id", zValidator("json", updateVehicleScenarioSchema), updateVehicleScenario);
vehicleScenariosAdminRoutes.delete("/:id", deleteVehicleScenario);

export default vehicleScenariosAdminRoutes;
