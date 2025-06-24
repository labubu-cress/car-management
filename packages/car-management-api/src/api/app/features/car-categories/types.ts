import type { CarCategory } from "@prisma/client";

export type CarCategory = CarCategory;

export type CarCategoryWithIsArchived = CarCategory & {
  isArchived: boolean;
  minPrice: number | null;
  maxPrice: number | null;
};
