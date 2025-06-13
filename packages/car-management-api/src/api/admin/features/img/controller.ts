import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createQcloudImgUploadToken } from "../../../../modules/cloud/qcloud.service";
import type { AdminAuthEnv } from "../../middleware/auth";

export const getUploadToken = async (c: Context<AdminAuthEnv>) => {
  const adminUser = c.get("adminUser");
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  try {
    const configWithToken = await createQcloudImgUploadToken(adminUser.tenantId);
    return c.json(configWithToken);
  } catch (e) {
    console.error(e);
    throw new HTTPException(500, { message: "Failed to get upload token" });
  }
};
