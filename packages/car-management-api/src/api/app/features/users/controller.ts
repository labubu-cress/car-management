import { wechatClient } from "@/lib/wechat";
import type { User } from "@prisma/client";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppAuthEnv } from "../../middleware/auth";
import type { UpdatePhoneNumberInput } from "./schema";
import * as appUserService from "./service";

export const getCurrentUser = async (c: Context<AppAuthEnv>) => {
  const user = c.get("user");
  return c.json(user);
};

export const updatePhoneNumber = async (c: Context) => {
  const user = c.get("user") as User;
  const { code } = c.get("validatedData") as UpdatePhoneNumberInput;

  try {
    const { phoneNumber } = (await wechatClient.getPhoneNumber(code)) ?? {};
    if (!phoneNumber) {
      throw new HTTPException(400, { message: "Invalid code from wechat" });
    }
    const updatedUser = await appUserService.updatePhoneNumber(user.tenantId, user.openId, phoneNumber);
    return c.json(updatedUser);
  } catch (error: any) {
    console.error("Update phone number error:", error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: "Error updating phone number", cause: error });
  }
};
