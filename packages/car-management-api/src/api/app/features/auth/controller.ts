import { wechatClient } from "@/lib/wechat";
import type { Context } from "hono";
import type { AppLoginInput } from "./schema";
import * as appAuthService from "./service";

export const login = async (c: Context) => {
  const { code, tenantId } = c.get("validatedData") as AppLoginInput;

  const { openid, unionid } = await wechatClient.code2Session(code);
  const { token, user } = await appAuthService.loginOrRegister(tenantId, openid, unionid);
  return c.json({ token, user });
};
