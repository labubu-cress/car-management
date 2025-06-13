import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { appAuthMiddleware } from "../../middleware/auth";
import { getCurrentUser, updatePhoneNumber } from "./controller";
import { updatePhoneNumberSchema } from "./schema";

const appUserRoutes = new Hono();

// All routes here are protected
appUserRoutes.use("*", appAuthMiddleware);

appUserRoutes.get("/current", getCurrentUser);
appUserRoutes.post("/current/phone-number", zValidator("json", updatePhoneNumberSchema), updatePhoneNumber);

export default appUserRoutes;
