import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as controller from "./controller";
import { paramSchema } from "./schema";

const users = new Hono();

users.get("/", controller.getAllUsers);

users.get("/:id", zValidator("param", paramSchema), controller.getUserById);

export default users;
