import { z } from "zod";

// Zod schemas for car-related API validation will be defined here.

// Schema for creating a vehicle scenario
export const createVehicleScenarioSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
});

// Schema for updating a vehicle scenario
export const updateVehicleScenarioSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  description: z.string().min(1, { message: "Description is required" }).optional(),
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
});

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
