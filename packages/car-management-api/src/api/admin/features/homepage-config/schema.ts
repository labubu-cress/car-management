import { z } from "zod";

export const HomepageConfigUpdateSchema = z.object({
  firstTitle: z.string(),
  firstTitleIcon: z.string(),
  secondTitle: z.string(),
  secondTitleIcon: z.string(),
  bannerImage: z.string(),
  benefitsImage: z.string(),
});
