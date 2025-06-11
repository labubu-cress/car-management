import { tenantIdFromRequest } from "@/utils/tenant-id";
import type { Request, Response } from "express";
import * as authService from "../../services/app/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const tenantId = tenantIdFromRequest(req);
    const { code } = req.body;
    // todo: 微信小程序登录
    const openId = "";
    const unionId = "";
    const token = await authService.login(tenantId, openId, unionId);
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
