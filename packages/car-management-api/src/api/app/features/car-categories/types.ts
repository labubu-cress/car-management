import type { CarCategory as PrismaCarCategory } from "@prisma/client";

export type CarCategory = PrismaCarCategory;

export type CarCategoryWithIsArchived = PrismaCarCategory & { isArchived: boolean };
