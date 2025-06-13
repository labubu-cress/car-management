import { Hono } from "hono";
import vehicleScenariosAdminRoutes from "./routes";

const carsAdminApi = new Hono();

carsAdminApi.route("/", vehicleScenariosAdminRoutes);

// Later, other car-related routes (categories, trims) will be added here.

export default carsAdminApi;
