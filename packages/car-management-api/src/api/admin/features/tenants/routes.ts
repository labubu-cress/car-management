import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import * as controller from "./controller";
import { createTenantSchema, updateTenantSchema } from "./schema";

const tenants = new Hono();

tenants.get("/", controller.getAllTenants);
tenants.post("/", zValidator("json", createTenantSchema), controller.createTenant);
tenants.get("/:id", controller.getTenantById);
tenants.put("/:id", zValidator("json", updateTenantSchema), controller.updateTenant);
tenants.delete("/:id", controller.deleteTenant);

export default tenants;
