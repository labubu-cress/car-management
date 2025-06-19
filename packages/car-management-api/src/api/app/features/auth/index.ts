import { wechatClient } from "@/lib/wechat";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { appLoginSchema } from "./schema";
import { loginOrRegister } from "./service";

const app = new Hono();

app.post(
  "/login",
  async (c, next) => {
    const tenantId = c.req.param("tenantId");
    const body = await c.req.json();
    body.tenantId = tenantId;
    c.req.addValidatedData("json", body);
    await next();
  },
  zValidator("json", appLoginSchema),
  async (c) => {
    const { code, tenantId } = c.req.valid("json");

    const { openid, unionid } = await wechatClient.code2Session(code);
    const { token, user } = await loginOrRegister(tenantId, openid, unionid);
    return c.json({ token, user });
  },
);

export default app;
