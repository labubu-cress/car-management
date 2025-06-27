import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";

const app = new Hono<AdminAuthTenantEnv>();

const checkWritePermission = createMiddleware<AdminAuthTenantEnv>(async (c, next) => {
  const { adminUser } = c.var;
  if (adminUser.role === "tenant_viewer") {
    throw new HTTPException(403, { message: "You do not have permission to perform this action." });
  }
  await next();
});

app.get("/upload-token", checkWritePermission, async (c) => {
  const { tenantId } = c.var;
  const configWithToken = await createQcloudImgUploadToken(tenantId);
  return c.json(configWithToken);
});

export default app;
