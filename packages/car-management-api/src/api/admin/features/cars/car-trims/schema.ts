import { z } from "zod";

// Schema for creating a car trim
export const createCarTrimSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().min(1),
  image: z.string().url(),
  originalPrice: z.string(),
  currentPrice: z.string(),
  badge: z.string().optional(),
  features: z.array(z.object({ title: z.string(), value: z.string() })).optional(),
  categoryId: z.string().cuid(),
});

// Schema for updating a car trim
export const updateCarTrimSchema = createCarTrimSchema.partial();

export type CreateCarTrimInput = z.infer<typeof createCarTrimSchema>;
export type UpdateCarTrimInput = z.infer<typeof updateCarTrimSchema>;
