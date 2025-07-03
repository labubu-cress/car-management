import { z } from "zod";
import { carCategorySchema } from "../car-categories/schema";
import { carFeatureSchema } from "../shared/schema";

export const carTrimSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string(),
  configImageUrl: z.string().nullable(),
  badge: z.string().nullable(),
  originalPrice: z.coerce.number(),
  currentPrice: z.coerce.number(),
  priceOverrideText: z.string().nullable(),
  features: z.array(carFeatureSchema),
  categoryId: z.string(),
  displayOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  isFavorited: z.boolean().optional(),
});

export const carTrimWithCategorySchema = carTrimSchema.extend({
  category: carCategorySchema,
});
