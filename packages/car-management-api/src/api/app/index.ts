import { Hono, type Context } from "hono";
import carsAppApi from "./features/cars";

const app = new Hono();

// Mount the cars app API
app.route("/cars", carsAppApi);

// 后续将在此处聚合所有 app 功能路由
app.get("/", (c: Context) => c.json({ message: "Welcome to App API" }));

export default app;
