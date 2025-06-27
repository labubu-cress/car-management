import type { CarCategory as PrismaCarCategory } from "@prisma/client";

export type CarCategory = PrismaCarCategory;

export type CarCategoryWithIsArchived = Omit<PrismaCarCategory, "minPrice" | "maxPrice"> & {
  isArchived: boolean;
  minPrice: number | null;
  maxPrice: number | null;
};
