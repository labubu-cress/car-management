import { tenantIdFromRequest } from "@/utils/tenant-id";
import { wechatClient } from "@/wechat/client";
import type { Request, Response } from "express";
import * as authService from "../../services/app/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { code } = req.body;
    const { openid, unionid } = await wechatClient.code2Session(code);
    const { token, user } = (await authService.login(tenantId, openid, unionid)) ?? {};
    if (token) {
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
