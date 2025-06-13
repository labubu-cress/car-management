import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createCarCategory,
  deleteCarCategory,
  getAllCarCategories,
  getCarCategoryById,
  updateCarCategory,
} from "./controller";
import { createCarCategorySchema, updateCarCategorySchema } from "./schema";

const carCategoriesAdminRoutes = new Hono();

// CarCategory Routes
carCategoriesAdminRoutes.post("/", zValidator("json", createCarCategorySchema), createCarCategory);
carCategoriesAdminRoutes.get("/", getAllCarCategories);
carCategoriesAdminRoutes.get("/:id", getCarCategoryById);
carCategoriesAdminRoutes.put("/:id", zValidator("json", updateCarCategorySchema), updateCarCategory);
carCategoriesAdminRoutes.delete("/:id", deleteCarCategory);

export default carCategoriesAdminRoutes;
