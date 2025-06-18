import { z } from "zod";

export const vehicleScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

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

export type CreateVehicleScenarioInput = z.infer<typeof createVehicleScenarioSchema>;
export type UpdateVehicleScenarioInput = z.infer<typeof updateVehicleScenarioSchema>;
