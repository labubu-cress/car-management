import { Hono } from "hono";
import type { AppTenantEnv } from "../../middleware/tenant";
import { getAllFaqs } from "./service";

const app = new Hono<AppTenantEnv>();

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const faqs = await getAllFaqs(tenantId);
  return c.json(faqs);
});

export default app; 