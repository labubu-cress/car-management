import { Hono } from "hono";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import { getDashboardStats } from "./service";

const dashboard = new Hono<AdminAuthTenantEnv>();

dashboard.get("/stats", async (c) => {
  const { tenantId } = c.var;
  const stats = await getDashboardStats(tenantId);
  return c.json(stats);
});

export default dashboard;
