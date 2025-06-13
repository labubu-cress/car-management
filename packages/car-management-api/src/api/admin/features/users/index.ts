import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../middleware/auth";
import { getUserByIdSchema } from "./schema";
import { getAllUsers, getUserById } from "./service";

const app = new Hono<{ Variables: AdminAuthEnv["Variables"] }>();

app.use("*", async (c, next) => {
  const { adminUser } = c.var;
  if (!adminUser.tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  await next();
});

app.get("/", async (c) => {
  const { adminUser } = c.var;
  const users = await getAllUsers(adminUser.tenantId as string);
  return c.json(users);
});

app.get("/:id", zValidator("param", getUserByIdSchema), async (c) => {
  const { adminUser } = c.var;
  const { id } = c.req.valid("param");

  const user = await getUserById(adminUser.tenantId as string, id);
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  // A tenant should not be able to see users from another tenant.
  // The service logic already scopes this by tenantId, but as a safeguard:
  if (user.tenantId !== adminUser.tenantId) {
    throw new HTTPException(404, { message: "User not found" });
  }
  return c.json(user);
});

export default app;
