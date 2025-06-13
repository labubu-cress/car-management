import { z } from "zod";

// Schema for creating a car category
export const createCarCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
  badge: z.string().optional(),
  tags: z.array(z.string()).optional(),
  highlights: z.array(z.object({ title: z.string(), value: z.string() })).optional(),
  interiorImages: z.array(z.string().url()).optional(),
  exteriorImages: z.array(z.string().url()).optional(),
  offerPictures: z.array(z.string().url()).optional(),
});

// Schema for updating a car category
export const updateCarCategorySchema = createCarCategorySchema.partial();

export type CreateCarCategoryInput = z.infer<typeof createCarCategorySchema>;
export type UpdateCarCategoryInput = z.infer<typeof updateCarCategorySchema>;
