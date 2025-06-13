import { Hono } from "hono";
import carsAppRoutes from "./routes";

const carsAppApi = new Hono();

carsAppApi.route("/", carsAppRoutes);

// Later, other app car-related routes can be added here.

export default carsAppApi;
