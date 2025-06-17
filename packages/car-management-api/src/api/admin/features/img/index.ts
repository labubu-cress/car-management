import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import { Hono } from "hono";
import type { AdminAuthTenantEnv } from "../../middleware/auth";

const app = new Hono<{ Variables: AdminAuthTenantEnv["Variables"] }>();

app.get("/upload-token", async (c) => {
  const { tenantId } = c.var;
  const configWithToken = await createQcloudImgUploadToken(tenantId);
  return c.json(configWithToken);
});

export default app;
