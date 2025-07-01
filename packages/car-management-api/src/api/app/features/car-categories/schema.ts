import { z } from "zod";
import { carFeatureSchema } from "../shared/schema";
import { vehicleScenarioSchema } from "../vehicle-scenarios/schema";

// 为整个 CarCategory 模型创建一个包含解析后 JSON 字段的 Zod schema
export const carCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  minPrice: z.coerce.number(),
  maxPrice: z.coerce.number(),
  image: z.string(),
  badge: z.string().nullable(),
  tags: z.array(z.string()),
  highlights: z.array(carFeatureSchema),
  interiorImages: z.array(z.string()),
  exteriorImages: z.array(z.string()),
  offerPictures: z.array(z.string()),
  displayOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  vehicleScenarioId: z.string(),
  isArchived: z.boolean().default(false),
});

export const carCategoryWithScenarioSchema = carCategorySchema.extend({
  vehicleScenario: vehicleScenarioSchema.pick({ id: true, name: true }),
});
