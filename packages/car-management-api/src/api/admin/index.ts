import { Hono } from "hono";
import adminUsersRoutes from "./features/admin-users/routes";
import authRoutes from "./features/auth/routes";
import carsAdminApi from "./features/cars";
import tenantsAdminApi from "./features/tenants/routes";
import type { AdminAuthEnv } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";

const adminApi = new Hono();

const adminProtected = new Hono<{ Variables: AdminAuthEnv["Variables"] }>();

// All routes under /admin will be protected by the auth middleware
adminProtected.use("*", authMiddleware);

// Mount feature APIs
adminProtected.route("/cars", carsAdminApi);
adminProtected.route("/tenants", tenantsAdminApi);
adminProtected.route("/admin-users", adminUsersRoutes);

adminProtected.get("/", (c) => c.json({ message: "Welcome to Authenticated Admin API" }));

// Unprotected auth routes
adminApi.route("/auth", authRoutes);
// Protected routes
adminApi.route("/", adminProtected);

export default adminApi;
