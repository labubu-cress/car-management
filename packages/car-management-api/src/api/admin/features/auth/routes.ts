import { zodValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { login } from "./controller";
import { loginSchema } from "./schema";

const authRoutes = new Hono();

authRoutes.post("/login", zodValidator("json", loginSchema), login);

export default authRoutes;
