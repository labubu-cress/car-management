import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthTenantEnv } from "../../middleware/auth";
import { getUserByIdSchema } from "./schema";
import { getAllUsers, getUserById } from "./service";

const app = new Hono<AdminAuthTenantEnv>();

app.get("/", async (c) => {
  const { tenantId } = c.var;
  const users = await getAllUsers(tenantId);
  return c.json(users);
});

app.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { tenantId } = c.var;

  const user = await getUserById(tenantId, id);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  return c.json(user);
});

export default app;
