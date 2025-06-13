import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../../types/hono";
import appAuthRoutes from "./features/auth/routes";
import carsAppApi from "./features/cars";
import appUserRoutes from "./features/users/routes";
import { tenantMiddleware } from "./middleware/tenant";

const app = new Hono<AppEnv>();

// Apply tenant middleware to all routes
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

// Mount the app features
app.route("/auth", appAuthRoutes);
app.route("/users", appUserRoutes);
app.route("/cars", carsAppApi);

// 后续将在此处聚合所有 app 功能路由
app.get("/", (c: Context) => c.json({ message: "Welcome to App API" }));

export default app;
