import { zValidator } from "@hono/zod-validator";
import type { AdminUser } from "@prisma/client";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import { createAdminUserSchema, updateAdminUserSchema } from "./schema";
import { createAdminUser, deleteAdminUser, getAdminUserById, getAllAdminUsers, updateAdminUser } from "./service";

type LoggedInUser = AdminAuthEnv["Variables"]["adminUser"];

const hasAdminManipulationPermission = (user: LoggedInUser, targetUser: Partial<AdminUser>): boolean => {
  switch (user.role) {
    case "super_admin":
      return true;
    case "admin":
      if (targetUser.role === "super_admin" || targetUser.role === "admin") {
        return false;
      }
      // Admins can only manage users within their own tenant
      return user.tenantId === targetUser.tenantId;
    case "tenant_viewer":
      return false;
    default:
      return false;
  }
};

const hasReadPermission = (user: LoggedInUser, targetUser: Partial<AdminUser>): boolean => {
  if (user.role === "super_admin") {
    return true;
  }
  return user.tenantId === targetUser.tenantId;
};

const app = new Hono<AdminAuthEnv>();

// TODO: add writeAccessMiddleware to POST, PUT, DELETE routes

app.get("/", async (c) => {
  const { adminUser } = c.var;
  const users = await getAllAdminUsers();

  if (adminUser.role === "super_admin") {
    return c.json(users);
  }

  if (adminUser.role === "admin" || adminUser.role === "tenant_viewer") {
    const tenantUsers = users.filter((user) => user.tenantId === adminUser.tenantId);
    return c.json(tenantUsers);
  }

  return c.json([]);
});

app.post("/", zValidator("json", createAdminUserSchema), async (c) => {
  const { adminUser } = c.var;
  const body = c.req.valid("json");

  if (adminUser.role === "admin" && adminUser.tenantId !== body.tenantId) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  if (!hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  const newUser = await createAdminUser(body);
  return c.json(newUser, 201);
});

app.get("/:id", async (c) => {
  const { adminUser } = c.var;
  const { id } = c.req.param();
  const user = await getAdminUserById(id);
  if (!user) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }
  if (!hasReadPermission(adminUser, user)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
  return c.json(user);
});

app.put("/:id", zValidator("json", updateAdminUserSchema), async (c) => {
  const { id } = c.req.param();
  const { adminUser } = c.var;
  const body = c.req.valid("json");

  const targetUser = await getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser) || !hasAdminManipulationPermission(adminUser, body)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const updatedUser = await updateAdminUser(id, body);
  return c.json(updatedUser);
});

app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const { adminUser } = c.var;

  const targetUser = await getAdminUserById(id);
  if (!targetUser) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  if (!hasAdminManipulationPermission(adminUser, targetUser)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await deleteAdminUser(id);
  return c.body(null, 204);
});

export default app;
