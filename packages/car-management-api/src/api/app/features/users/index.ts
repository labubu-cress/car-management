import { prisma } from "@/lib/db";
import { WeChatClient } from "@/lib/wechat";
import { zValidator } from "@hono/zod-validator";
import type { User } from "@prisma/client";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppAuthEnv } from "../../middleware/auth";
import { appAuthMiddleware } from "../../middleware/auth";
import { updatePhoneNumberSchema } from "./schema";
import { updatePhoneNumber as updateUserPhoneNumber } from "./service";

const app = new Hono<AppAuthEnv>();

// All routes here are protected
app.use("*", appAuthMiddleware);

app.get("/current", (c) => {
  const user = c.get("user");
  return c.json(user);
});

app.post("/current/phone-number", zValidator("json", updatePhoneNumberSchema), async (c) => {
  const user = c.get("user") as User;
  const { code } = c.req.valid("json");

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  if (!tenant || !tenant.appId || !tenant.appSecret) {
    return c.json({ message: "Tenant WeChat configuration is missing or invalid." }, 400);
  }

  const wechatClient = new WeChatClient(tenant.appId, tenant.appSecret);
  const phoneInfo = await wechatClient.getPhoneNumber(code);

  if (!phoneInfo?.phoneNumber) {
    throw new HTTPException(400, { message: "Invalid code from wechat" });
  }
  const updatedUser = await updateUserPhoneNumber(user.tenantId, user.openId, phoneInfo.phoneNumber);
  return c.json(updatedUser);
});

export default app;
