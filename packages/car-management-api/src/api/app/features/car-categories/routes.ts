import { Hono } from "hono";
import { getAllCarCategories, getCarCategoryById } from "./controller";

const carCategoriesAppRoutes = new Hono();

// CarCategory Routes
carCategoriesAppRoutes.get("/", getAllCarCategories);
carCategoriesAppRoutes.get("/:id", getCarCategoryById);

export default carCategoriesAppRoutes;
