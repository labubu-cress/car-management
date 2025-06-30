import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HttpError } from "http-errors";
import adminUsersRoutes from "./features/admin-users";
import authRoutes from "./features/auth";
import carCategoriesAdminRoutes from "./features/car-categories";
import carTrimsAdminRoutes from "./features/car-trims";
import contactUsConfigRoutes from "./features/contact-us-config";
import dashboardRoutes from "./features/dashboard";
import faqsRoutes from "./features/faqs";
import homepageConfigRoutes from "./features/homepage-config";
import imgRoutes from "./features/img";
import me from './features/me';
import tenantsRoutes from "./features/tenants";
import userMessagesRoutes from "./features/user-messages";
import usersRoutes from "./features/users";
import vehicleScenariosRoutes from "./features/vehicle-scenarios";
import type { AdminAuthEnv, AdminAuthTenantEnv } from "./middleware/auth";
import { authMiddleware, superAdminMiddleware, tenantAccessMiddleware } from "./middleware/auth";

const adminApi = new Hono();

adminApi.onError((err: Error, c) => {
  const httpError = err as HttpError;
  if (httpError.statusCode) {
    c.status(httpError.statusCode as any);
    return c.json({ message: httpError.message });
  }

  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error("Admin API Error:", err);
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

const authProtected = new Hono<AdminAuthEnv>();
authProtected.use("*", authMiddleware);

authProtected.route("/tenants", tenantsRoutes);
authProtected.route("/admin-users", adminUsersRoutes);
authProtected.route('/me', me);

const tenantSpecificRoutes = new Hono<AdminAuthTenantEnv>();
tenantSpecificRoutes.use("/*", tenantAccessMiddleware);

tenantSpecificRoutes.route("/vehicle-scenarios", vehicleScenariosRoutes);
tenantSpecificRoutes.route("/car-categories", carCategoriesAdminRoutes);
tenantSpecificRoutes.route("/car-trims", carTrimsAdminRoutes);
tenantSpecificRoutes.route("/users", usersRoutes);
tenantSpecificRoutes.route("/img", imgRoutes);
tenantSpecificRoutes.route("/dashboard", dashboardRoutes);
tenantSpecificRoutes.route("/homepage-config", homepageConfigRoutes);
tenantSpecificRoutes.route("/contact-us-config", contactUsConfigRoutes);
tenantSpecificRoutes.route("/faqs", faqsRoutes);
tenantSpecificRoutes.route("/user-messages", userMessagesRoutes);

// Unprotected auth routes
adminApi.route("/auth", authRoutes);
// Protected routes
adminApi.route("/tenants/:tenantId", tenantSpecificRoutes);
adminApi.route("/", authProtected);
adminApi.route("/", superAdminProtected);

export default adminApi;
