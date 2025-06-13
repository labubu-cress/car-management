import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAllAdminUsers,
  updateAdminUser,
  type AdminAuthEnv,
} from "./controller";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "./schema";

type AdminUsersEnv = AdminAuthEnv & {
  Variables: {
    validatedData: CreateAdminUserInput | UpdateAdminUserInput;
  };
};

const adminUsersRoutes = new Hono<AdminUsersEnv>();

adminUsersRoutes.get("/", getAllAdminUsers);
adminUsersRoutes.post("/", zValidator("json", createAdminUserSchema), createAdminUser);

adminUsersRoutes.get("/:id", getAdminUserById);
adminUsersRoutes.put("/:id", zValidator("json", updateAdminUserSchema), updateAdminUser);
adminUsersRoutes.delete("/:id", deleteAdminUser);

export default adminUsersRoutes;
