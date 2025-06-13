import { Hono } from "hono";
import { getAllCarTrims, getCarTrimById } from "./controller";

const carTrimsAppRoutes = new Hono();

// CarTrim Routes
carTrimsAppRoutes.get("/", getAllCarTrims);
carTrimsAppRoutes.get("/:id", getCarTrimById);

export default carTrimsAppRoutes;
