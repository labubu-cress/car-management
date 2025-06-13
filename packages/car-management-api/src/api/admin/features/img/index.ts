import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";

const app = new Hono<{ Variables: AdminAuthEnv["Variables"] }>();

app.get("/upload-token", async (c) => {
  const { adminUser } = c.var;
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const configWithToken = await createQcloudImgUploadToken(adminUser.tenantId);
  return c.json(configWithToken);
});

export default app;
