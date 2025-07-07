import { z } from "zod";

export const HomepageConfigUpdateSchema = z
  .object({
    firstTitle: z.string(),
    firstTitleIcon: z.string(),
    secondTitle: z.string(),
    secondTitleIcon: z.string(),
    bannerImage: z.string().optional(),
    bannerVideo: z.string().optional(),
    bannerTitle: z.string().optional(),
    bannerDescription: z.string().optional(),
    benefitsImage: z.string(),
  })
  .refine(
    (data) => {
      const { bannerImage, bannerVideo } = data;
      if (bannerImage && bannerVideo) {
        return false;
      }
      return true;
    },
    {
      message: "bannerImage and bannerVideo cannot both exist",
      path: ["bannerImage"],
    },
  )
  .refine(
    (data) => {
      const { bannerImage, bannerVideo } = data;
      if (!bannerImage && !bannerVideo) {
        return false;
      }
      return true;
    },
    {
      message: "One of bannerImage or bannerVideo must be provided",
      path: ["bannerImage"],
    },
  );
