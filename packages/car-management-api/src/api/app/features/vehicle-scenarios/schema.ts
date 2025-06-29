import { z } from "zod";

export const vehicleScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
