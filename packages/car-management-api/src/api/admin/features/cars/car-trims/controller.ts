import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AdminAuthEnv } from "../../../middleware/auth";
import type { CreateCarTrimInput, UpdateCarTrimInput } from "./schema";
import * as Service from "./service";

type ControllerEnv<T = unknown> = AdminAuthEnv & {
  Variables: {
    validatedData: T;
  };
};

export const createCarTrim = async (c: Context<ControllerEnv<CreateCarTrimInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }

  const newTrim = await Service.createCarTrim(tenantId, validatedData);
  return c.json(newTrim, 201);
};

export const getAllCarTrims = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { categoryId } = c.req.query();
  if (!categoryId) {
    return c.json({ message: "categoryId query parameter is required" }, 400);
  }
  const trims = await Service.getAllCarTrims(tenantId, categoryId);
  return c.json(trims);
};

export const getCarTrimById = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  const trim = await Service.getCarTrimById(tenantId, id);
  if (trim) {
    return c.json(trim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};

export const updateCarTrim = async (c: Context<ControllerEnv<UpdateCarTrimInput>>) => {
  const { tenantId, validatedData } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();

  const updatedTrim = await Service.updateCarTrim(tenantId, id, validatedData);
  if (updatedTrim) {
    return c.json(updatedTrim);
  }
  return c.json({ message: "Car trim not found" }, 404);
};

export const deleteCarTrim = async (c: Context<AdminAuthEnv>) => {
  const { tenantId } = c.var;
  if (!tenantId) {
    throw new HTTPException(403, { message: "Forbidden: No tenant associated" });
  }
  const { id } = c.req.param();
  await Service.deleteCarTrim(tenantId, id);
  return c.body(null, 204);
};
