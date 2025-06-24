import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { resolveTenantSchema } from "./schema";
import { AppService } from "./service";

const app = new Hono();
const service = new AppService();

app.get("/", zValidator("query", resolveTenantSchema), async (c) => {
  const { appId } = c.req.valid("query");
  const res = await service.resolveTenant(appId);
  return c.json(res);
});

export default app;
