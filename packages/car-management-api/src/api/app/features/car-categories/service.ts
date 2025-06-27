import { prisma } from "@/lib/db";
import type { CarCategoryWithIsArchived } from "./types";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategoryWithIsArchived[]> => {
  const categories = await prisma.carCategory.findMany({
    where: { tenantId },
    include: {
      carTrims: {
        where: { isArchived: false },
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return categories
    .map((c) => {
      const isArchived = c.carTrims.length === 0;

      if (isArchived) {
        return {
          ...c,
          isArchived,
          minPrice: null,
          maxPrice: null,
        };
      }

      return {
        ...c,
        isArchived,
        minPrice: c.minPrice.toNumber(),
        maxPrice: c.maxPrice.toNumber(),
      };
    })
    .filter((c) => !c.isArchived);
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategoryWithIsArchived | null> => {
  const category = await prisma.carCategory.findUnique({
    where: { id, tenantId },
    include: { carTrims: { where: { isArchived: false } } },
  });

  if (!category) {
    return null;
  }

  const isArchived = category.carTrims.length === 0;

  if (isArchived) {
    return {
      ...category,
      isArchived,
      minPrice: null,
      maxPrice: null,
    };
  }

  return {
    ...category,
    isArchived,
    minPrice: category.minPrice.toNumber(),
    maxPrice: category.maxPrice.toNumber(),
  };
};
