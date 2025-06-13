import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";

export const getUploadToken = async (c: Context<AdminAuthEnv>) => {
  const { adminUser } = c.var;
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const configWithToken = await createQcloudImgUploadToken(adminUser.tenantId);
  return c.json(configWithToken);
};
