import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import type { AddressInfo } from "net";
import adminRoutes from "./api/admin";
import appRoutes from "./api/app";

const app = new Hono().basePath("/api/v1");

// Mount the admin and app routes
app.route("/admin", adminRoutes);
app.route("/app", appRoutes);

app.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

const port = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "test") {
  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info: AddressInfo) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}

export default app;
