import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { login } from "./controller";
import { appLoginSchema } from "./schema";

const appAuthRoutes = new Hono();

appAuthRoutes.post("/login", zValidator("json", appLoginSchema), login);

export default appAuthRoutes;
