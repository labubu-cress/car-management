import { z } from "zod";

export const carFeatureSchema = z.object({
  name: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

export type CarFeature = z.infer<typeof carFeatureSchema>;
