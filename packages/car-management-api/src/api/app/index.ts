import { Hono, type Context } from "hono";
import appAuthRoutes from "./features/auth/routes";
import carsAppApi from "./features/cars";
import appUserRoutes from "./features/users/routes";

const app = new Hono();

// Mount the app features
app.route("/auth", appAuthRoutes);
app.route("/users", appUserRoutes);
app.route("/cars", carsAppApi);

// 后续将在此处聚合所有 app 功能路由
app.get("/", (c: Context) => c.json({ message: "Welcome to App API" }));

export default app;
