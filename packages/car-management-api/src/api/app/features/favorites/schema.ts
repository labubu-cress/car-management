import { carCategoryWithScenarioSchema } from "../car-categories/schema";
import { carTrimWithCategorySchema } from "../car-trims/schema";

export const favoriteCarTrimSchema = carTrimWithCategorySchema.extend({
  category: carCategoryWithScenarioSchema,
}); 