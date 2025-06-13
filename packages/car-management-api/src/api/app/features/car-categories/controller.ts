import type { AppEnv } from "@/types/hono";
import type { Context } from "hono";
import * as Service from "./service";

export const getAllCarCategories = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const categories = await Service.getAllCarCategories(tenantId);
  return c.json(categories);
};

export const getCarCategoryById = async (c: Context<AppEnv>) => {
  const { tenantId } = c.var;
  const { id } = c.req.param();
  const category = await Service.getCarCategoryById(tenantId, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
};
