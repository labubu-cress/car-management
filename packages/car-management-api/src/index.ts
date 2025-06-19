import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
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
  const server = new Hono();

  server.route("/", app);

  // Serve static files for the dashboard. The path is relative to the execution directory.
  // In the Docker container, we'll place the frontend build output in `dist/dashboard`.
  server.use("/dashboard/*", serveStatic({ root: "./dist/dashboard/" }));
  server.get("/dashboard", serveStatic({ path: "./dist/dashboard/index.html" }));
  serve({
    fetch: server.fetch,
    port,
  });
  console.log(`Server is running on http://localhost:${port}`);
}

export default app;
