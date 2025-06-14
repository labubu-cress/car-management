import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import adminUsersRoutes from "./features/admin-users";
import authRoutes from "./features/auth";
import carCategoriesAdminRoutes from "./features/car-categories";
import carTrimsAdminRoutes from "./features/car-trims";
import imgAdminApi from "./features/img";
import tenantsAdminApi from "./features/tenants";
import usersAdminApi from "./features/users";
import vehicleScenariosAdminRoutes from "./features/vehicle-scenarios";
import type { AdminAuthEnv, AdminAuthTenantEnv } from "./middleware/auth";
import { authMiddleware, superAdminMiddleware, tenantAccessMiddleware } from "./middleware/auth";

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

const superAdminProtected = new Hono<AdminAuthEnv>();
superAdminProtected.use("*", superAdminMiddleware);

superAdminProtected.route("/tenants", tenantsAdminApi);

const authProtected = new Hono<AdminAuthEnv>();
authProtected.use("*", authMiddleware);

authProtected.route("/admin-users", adminUsersRoutes);

const tenantSpecificRoutes = new Hono<AdminAuthTenantEnv>();
tenantSpecificRoutes.use("/*", tenantAccessMiddleware);

tenantSpecificRoutes.route("/vehicle-scenarios", vehicleScenariosAdminRoutes);
tenantSpecificRoutes.route("/car-categories", carCategoriesAdminRoutes);
tenantSpecificRoutes.route("/car-trims", carTrimsAdminRoutes);
tenantSpecificRoutes.route("/users", usersAdminApi);
tenantSpecificRoutes.route("/img", imgAdminApi);

// Unprotected auth routes
adminApi.route("/auth", authRoutes);
// Protected routes
adminApi.route("/", superAdminProtected);
adminApi.route("/", authProtected);
adminApi.route("/tenants/:tenantId", tenantSpecificRoutes);

export default adminApi;
