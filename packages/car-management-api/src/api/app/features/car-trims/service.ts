import { prisma } from "@/lib/db";
import type { CarFeature } from "../shared/schema";
import type { CarTrim } from "./types";

const transformPrismaTrim = (trim: any, favoritedTrimIds: Set<string>): CarTrim => {
  const { features, originalPrice, currentPrice, ...rest } = trim;

  return {
    ...rest,
    originalPrice: originalPrice.toNumber(),
    currentPrice: currentPrice.toNumber(),
    features: (features as CarFeature[]) ?? [],
    isFavorited: favoritedTrimIds.has(trim.id),
  };
};

export const getAllCarTrims = async (tenantId: string, categoryId: string, userId?: string): Promise<CarTrim[]> => {
  let favoritedTrimIds = new Set<string>();
  if (userId) {
    const userFavorites = await prisma.userFavoriteCarTrim.findMany({
      where: { userId, carTrim: { tenantId, categoryId } },
      select: { carTrimId: true },
    });
    favoritedTrimIds = new Set(userFavorites.map((fav) => fav.carTrimId));
  }

  const trims = await prisma.carTrim.findMany({
    where: { categoryId, tenantId, isArchived: false },
    orderBy: { displayOrder: "asc" },
  });

  return trims.map((trim) => transformPrismaTrim(trim, favoritedTrimIds));
};

export const getCarTrimById = async (tenantId: string, id: string, userId?: string): Promise<CarTrim | null> => {
  const trim = await prisma.carTrim.findFirst({
    where: { id, tenantId, isArchived: false },
  });

  if (!trim) {
    return null;
  }

  let favoritedTrimIds = new Set<string>();
  if (userId) {
    const userFavorite = await prisma.userFavoriteCarTrim.findUnique({
      where: { userId_carTrimId: { userId, carTrimId: id } },
      select: { carTrimId: true },
    });
    if (userFavorite) {
      favoritedTrimIds.add(userFavorite.carTrimId);
    }
  }

  return transformPrismaTrim(trim, favoritedTrimIds);
};
