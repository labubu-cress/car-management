import { zodValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createAdminUser, deleteAdminUser, getAdminUserById, getAllAdminUsers, updateAdminUser } from "./controller";
import { createAdminUserSchema, updateAdminUserSchema } from "./schema";

const adminUsersRoutes = new Hono();

adminUsersRoutes.get("/", getAllAdminUsers);
adminUsersRoutes.post("/", zodValidator("json", createAdminUserSchema), createAdminUser);

adminUsersRoutes.get("/:id", getAdminUserById);
adminUsersRoutes.put("/:id", zodValidator("json", updateAdminUserSchema), updateAdminUser);
adminUsersRoutes.delete("/:id", deleteAdminUser);

export default adminUsersRoutes;
