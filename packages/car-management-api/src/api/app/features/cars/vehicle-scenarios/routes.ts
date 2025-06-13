import { Hono } from "hono";
import { getAllVehicleScenarios, getVehicleScenarioById } from "./controller";

const vehicleScenariosAppRoutes = new Hono();

// VehicleScenario Routes
vehicleScenariosAppRoutes.get("/", getAllVehicleScenarios);
vehicleScenariosAppRoutes.get("/:id", getVehicleScenarioById);

export default vehicleScenariosAppRoutes;
