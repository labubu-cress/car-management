import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import type { HttpError } from "http-errors";
import * as fs from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import adminRoutes from "./api/admin";
import appRoutes from "./api/app";

const app = new Hono().basePath("/api/v1");

app.onError((err: Error, c) => {
  const httpError = err as HttpError;
  if (httpError.statusCode) {
    c.status(httpError.statusCode as any);
    return c.json({ message: httpError.message });
  }
  console.error("API Error:", err);
  c.status(500);
  return c.json({ message: "Internal Server Error" });
});

// Mount the admin and app routes
app.route("/admin", adminRoutes);
app.route("/app", appRoutes);

app.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

if (process.env.NODE_ENV !== "test") {
  const server = new Hono();

  server.route("/", app);

  // Serve static files for the dashboard. The path is relative to the execution directory.
  // In the Docker container, we'll place the frontend build output in `dist/dashboard`.
  server.use("/dashboard/*", serveStatic({ root: "./dist/" }));
  server.get("/dashboard", serveStatic({ path: "./dist/dashboard/index.html" }));

  const enableHttps = process.env.ENABLE_HTTPS === "true";

  if (enableHttps) {
    console.log("HTTPS is enabled. Attempting to start HTTPS server.");

    const keyPath =
      process.env.KEY_PATH || ".certificates/guanjiecar.com.key";
    const certPath =
      process.env.CERT_PATH || ".certificates/guanjiecar.com.pem";
    const port = Number(process.env.PORT) || 443;

    try {
      const serverOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      serve(
        {
          fetch: server.fetch,
          port,
          createServer: createHttpsServer,
          serverOptions,
        },
        (info) => {
          console.log(`Server is running on https://localhost:${info.port}`);
        },
      );
    } catch (error) {
      console.error(
        "Failed to start HTTPS server. Make sure certificate files are available at the specified paths.",
        error,
      );
      process.exit(1);
    }
  } else {
    console.log("HTTPS is not enabled. Starting HTTP server.");
    const port = Number(process.env.PORT) || 3000;
    serve(
      {
        fetch: server.fetch,
        port,
        createServer: createHttpServer,
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
      },
    );
  }
}

export default app;
