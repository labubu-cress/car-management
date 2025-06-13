import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { login } from "./controller";
import { loginSchema } from "./schema";

const authRoutes = new Hono();

authRoutes.post("/login", zValidator("json", loginSchema), login);

export default authRoutes;
