import { z } from "zod";
import { carFeatureSchema } from "../shared/schema";

export const carTrimSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string().url(),
  badge: z.string().nullable(),
  originalPrice: z.string(),
  currentPrice: z.string(),
  features: z.array(carFeatureSchema),
  categoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CarTrim = z.infer<typeof carTrimSchema>;

// Schema for creating a car trim
export const createCarTrimSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().min(1),
  image: z.string().url(),
  originalPrice: z.string(),
  currentPrice: z.string(),
  badge: z.string().optional(),
  features: z.array(carFeatureSchema).optional().default([]),
  categoryId: z.string().cuid(),
});

// Schema for updating a car trim
export const updateCarTrimSchema = createCarTrimSchema.partial();

export type CreateCarTrimInput = z.infer<typeof createCarTrimSchema>;
export type UpdateCarTrimInput = z.infer<typeof updateCarTrimSchema>;
