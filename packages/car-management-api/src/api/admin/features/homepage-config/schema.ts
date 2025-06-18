import { z } from "zod";

export const HomepageConfigUpdateSchema = z.object({
  welcomeTitle: z.string().optional(),
  welcomeDescription: z.string().optional(),
  bannerImage: z.string(),
  benefitsImage: z.string(),
});
