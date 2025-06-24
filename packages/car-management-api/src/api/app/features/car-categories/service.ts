import { prisma } from "@/lib/db";
import type { CarCategoryWithIsArchived } from "./types";

export const getAllCarCategories = async (tenantId: string): Promise<CarCategoryWithIsArchived[]> => {
  const categories = await prisma.carCategory.findMany({
    where: { tenantId },
    include: {
      carTrims: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return categories
    .map((c) => {
      const isArchived = c.carTrims.length === 0 || c.carTrims.every((trim) => trim.isArchived);
      return {
        ...c,
        isArchived,
      };
    })
    .filter((c) => !c.isArchived);
};

export const getCarCategoryById = async (tenantId: string, id: string): Promise<CarCategoryWithIsArchived | null> => {
  const category = await prisma.carCategory.findUnique({
    where: { id, tenantId },
    include: { carTrims: true },
  });

  if (!category) {
    return null;
  }

  const isArchived = category.carTrims.length > 0 && category.carTrims.every((trim) => trim.isArchived);

  return {
    ...category,
    isArchived,
  };
};
