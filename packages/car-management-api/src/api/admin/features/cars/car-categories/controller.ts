import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../../middleware/auth";
import type { CreateCarCategoryInput, UpdateCarCategoryInput } from "./schema";
import * as Service from "./service";

type ControllerEnv<T = unknown> = AdminAuthEnv & {
  Variables: {
    validatedData: T;
  };
};

export const createCarCategory = async (c: Context<ControllerEnv<CreateCarCategoryInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const newCategory = await Service.createCarCategory(tenantId, validatedData);
  return c.json(newCategory, 201);
};

export const getAllCarCategories = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const categories = await Service.getAllCarCategories(tenantId);
  return c.json(categories);
};

export const getCarCategoryById = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  const category = await Service.getCarCategoryById(tenantId, id);
  if (category) {
    return c.json(category);
  }
  return c.json({ message: "Car category not found" }, 404);
};

export const updateCarCategory = async (c: Context<ControllerEnv<UpdateCarCategoryInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();

  const updatedCategory = await Service.updateCarCategory(tenantId, id, validatedData);
  if (updatedCategory) {
    return c.json(updatedCategory);
  }
  return c.json({ message: "Car category not found" }, 404);
};

export const deleteCarCategory = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  await Service.deleteCarCategory(tenantId, id);
  return c.body(null, 204);
};
