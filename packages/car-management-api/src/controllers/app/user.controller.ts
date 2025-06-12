import type { Request, Response } from "express";

import * as userService from "@/services/app/user.service";
import { wechatClient } from "@/wechat/client";

export const getCurrentUser = async (req: Request, res: Response) => {
  res.json(req.user);
};

export const updatePhoneNumber = async (req: Request, res: Response) => {
  const { openId, tenantId } = req.user!;
  const { code } = req.body;
  try {
    const { phoneNumber } = (await wechatClient.getPhoneNumber(code)) ?? {};
    if (!phoneNumber) {
      res.status(400).json({ message: "Invalid code" });
      return;
    }
    const user = await userService.updatePhoneNumber(tenantId, openId, phoneNumber);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating phone number" });
  }
};
