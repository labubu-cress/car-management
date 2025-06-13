import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { loginSchema } from "./schema";
import { login } from "./service";

const app = new Hono();

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const result = await login(username, password);
  if (!result) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  return c.json(result);
});

export default app;
