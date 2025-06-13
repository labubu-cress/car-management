import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import adminUsersRoutes from "./features/admin-users/routes";
import authRoutes from "./features/auth/routes";
import carsAdminApi from "./features/cars";
import imgAdminApi from "./features/img/routes";
import tenantsAdminApi from "./features/tenants/routes";
import usersAdminApi from "./features/users/routes";
import type { AdminAuthEnv } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";

const adminApi = new Hono();

adminApi.onError((err, c) => {
  console.error(`Admin API Error: ${err}`);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json(
    {
      message: "An error occurred in the Admin API.",
      error: err.message,
    },
    500,
  );
});

const adminProtected = new Hono<{ Variables: AdminAuthEnv["Variables"] }>();

// All routes under /admin will be protected by the auth middleware
adminProtected.use("*", authMiddleware);

// Mount feature APIs
adminProtected.route("/cars", carsAdminApi);
adminProtected.route("/tenants", tenantsAdminApi);
adminProtected.route("/admin-users", adminUsersRoutes);
adminProtected.route("/users", usersAdminApi);
adminProtected.route("/img", imgAdminApi);

adminProtected.get("/", (c) => c.json({ message: "Welcome to Authenticated Admin API" }));

// Unprotected auth routes
adminApi.route("/auth", authRoutes);
// Protected routes
adminApi.route("/", adminProtected);

export default adminApi;
