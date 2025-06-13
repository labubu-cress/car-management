import * as authService from "@/modules/auth/auth.service";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { LoginInput } from "./schema";

export const login = async (c: Context) => {
  const { username, password } = c.get("validatedData") as LoginInput;

  const result = await authService.login(username, password);

  if (!result) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  return c.json(result);
};
