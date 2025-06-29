import { prisma } from "@/lib/db";
import type { CarFeature } from "../shared/schema";
import type { CarCategory } from "./types";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategory[]> => {
  const categories = await prisma.carCategory.findMany({
    where: { tenantId },
    include: {
      carTrims: {
        where: { isArchived: false },
        select: { id: true },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return categories
    .filter((c) => c.carTrims.length > 0)
    .map((c) => {
      const { carTrims, tags, highlights, interiorImages, exteriorImages, offerPictures, minPrice, maxPrice, ...rest } =
        c;
      return {
        ...rest,
        isArchived: false,
        minPrice: minPrice.toNumber(),
        maxPrice: maxPrice.toNumber(),
        tags: (tags as string[]) ?? [],
        highlights: (highlights as CarFeature[]) ?? [],
        interiorImages: (interiorImages as string[]) ?? [],
        exteriorImages: (exteriorImages as string[]) ?? [],
        offerPictures: (offerPictures as string[]) ?? [],
      };
    });
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategory | null> => {
  const category = await prisma.carCategory.findUnique({
    where: { id, tenantId },
    include: { carTrims: { where: { isArchived: false }, select: { id: true } } },
  });

  if (!category || category.carTrims.length === 0) {
    return null;
  }

  const { carTrims, tags, highlights, interiorImages, exteriorImages, offerPictures, minPrice, maxPrice, ...rest } =
    category;

  return {
    ...rest,
    isArchived: false,
    minPrice: minPrice.toNumber(),
    maxPrice: maxPrice.toNumber(),
    tags: (tags as string[]) ?? [],
    highlights: (highlights as CarFeature[]) ?? [],
    interiorImages: (interiorImages as string[]) ?? [],
    exteriorImages: (exteriorImages as string[]) ?? [],
    offerPictures: (offerPictures as string[]) ?? [],
  };
};
