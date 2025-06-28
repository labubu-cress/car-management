import { prisma } from "@/lib/db";
import { WeChatClient } from "@/lib/wechat";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { appLoginSchema } from "./schema";
import { loginOrRegister } from "./service";

const app = new Hono();

app.post(
  "/login",
  async (c, next) => {
    // Note: This middleware is a workaround to inject tenantId from URL into body for validation.
    // The tenantId is from the path /tenants/:tenantId/auth/login
    const tenantId = c.req.param("tenantId");
    const body = await c.req.json();
    body.tenantId = tenantId;
    c.req.addValidatedData("json", body);
    await next();
  },
  zValidator("json", appLoginSchema),
  async (c) => {
    const { code, tenantId } = c.req.valid("json");

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant || !tenant.appId || !tenant.appSecret) {
      return c.json({ message: "Tenant WeChat configuration is missing or invalid." }, 400);
    }

    const wechatClient = new WeChatClient(tenant.appId, tenant.appSecret);
    const { openid, unionid } = await wechatClient.code2Session(code);
    const { token, user } = await loginOrRegister(tenantId, openid, unionid);
    return c.json({ token, user });
  },
);

export default app;
