import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCarTrim, deleteCarTrim, getAllCarTrims, getCarTrimById, updateCarTrim } from "./controller";
import { createCarTrimSchema, updateCarTrimSchema } from "./schema";

const carTrimsAdminRoutes = new Hono();

carTrimsAdminRoutes.post("/", zValidator("json", createCarTrimSchema), createCarTrim);
carTrimsAdminRoutes.get("/", getAllCarTrims);
carTrimsAdminRoutes.get("/:id", getCarTrimById);
carTrimsAdminRoutes.put("/:id", zValidator("json", updateCarTrimSchema), updateCarTrim);
carTrimsAdminRoutes.delete("/:id", deleteCarTrim);

export default carTrimsAdminRoutes;
