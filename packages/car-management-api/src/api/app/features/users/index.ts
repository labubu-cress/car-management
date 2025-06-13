import { wechatClient } from "@/lib/wechat";
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

  const { phoneNumber } = (await wechatClient.getPhoneNumber(code)) ?? {};
  if (!phoneNumber) {
    throw new HTTPException(400, { message: "Invalid code from wechat" });
  }
  const updatedUser = await updateUserPhoneNumber(user.tenantId, user.openId, phoneNumber);
  return c.json(updatedUser);
});

export default app;
