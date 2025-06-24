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

      const prices = c.carTrims.map((trim) => trim.currentPrice.toNumber());
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return {
        ...c,
        isArchived,
        minPrice,
        maxPrice,
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

  const prices = category.carTrims.map((trim) => trim.currentPrice.toNumber());
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    ...category,
    isArchived,
    minPrice,
    maxPrice,
  };
};
