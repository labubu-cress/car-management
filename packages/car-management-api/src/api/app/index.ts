import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../../types/hono";
import authRoutes from "./features/auth";
import carCategoriesAppRoutes from "./features/car-categories";
import carTrimsAppRoutes from "./features/car-trims";
import appUserRoutes from "./features/users";
import vehicleScenariosAppRoutes from "./features/vehicle-scenarios";
import { tenantMiddleware } from "./middleware/tenant";

const app = new Hono<AppEnv>();

// Apply tenant middleware to all routes, except for auth
app.use("*", tenantMiddleware);

app.onError((err, c) => {
  console.error(`App API Error: ${err}`);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json(
    {
      message: "An error occurred in the App API.",
      error: err.message,
    },
    500,
  );
});

// Unprotected auth routes
app.route("/auth", authRoutes);

// Mount the app features
app.route("/users", appUserRoutes);
app.route("/vehicle-scenarios", vehicleScenariosAppRoutes);
app.route("/car-categories", carCategoriesAppRoutes);
app.route("/car-trims", carTrimsAppRoutes);

// 后续将在此处聚合所有 app 功能路由
app.get("/", (c: Context) => c.json({ message: "Welcome to App API" }));

export default app;
