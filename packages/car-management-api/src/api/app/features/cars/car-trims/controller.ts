import type { AppEnv } from "@/types/hono";
import type { Context } from "hono";
import * as Service from "./service";

export const getAllCarTrims = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  const trims = await Service.getAllCarTrims(tenantId, categoryId);
  return c.json(trims);
};

export const getCarTrimById = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const trim = await Service.getCarTrimById(tenantId, id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};
