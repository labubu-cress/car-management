import { z } from "zod";

export const carFeatureSchema = z.object({
  title: z.string(),
  icon: z.string(),
});

export type CarFeature = z.infer<typeof carFeatureSchema>;
