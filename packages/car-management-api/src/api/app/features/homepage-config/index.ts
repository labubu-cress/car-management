import { Hono } from "hono";
import type { AppTenantEnv } from "../../middleware/tenant";
import { getHomepageConfig } from "./service";

const app = new Hono<AppTenantEnv>();

app.get("/", async (c) => {
  const tenantId = c.get("tenantId");
  const config = await getHomepageConfig(tenantId);

  if (!config) {
    return c.json({ error: "Homepage config not found" }, 404);
  }

  return c.json(config);
});

export default app;
