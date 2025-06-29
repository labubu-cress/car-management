import { prisma } from "@/lib/db";
import type { UserFavoriteCarTrim } from "@prisma/client";
import type { CarCategory } from "../car-categories/types";
import type { CarTrimWithCategory } from "../car-trims/types";
import type { CarFeature } from "../shared/schema";

// This is getting repetitive. Maybe I should have a transformer file.
const transformPrismaCategory = (category: any): CarCategory => {
  const { highlights, tags, interiorImages, exteriorImages, offerPictures, minPrice, maxPrice, ...rest } = category;
  return {
    ...rest,
    minPrice: minPrice.toNumber(),
    maxPrice: maxPrice.toNumber(),
    isArchived: false, // In favorites, we probably don't have archived things. Let's assume false.
    highlights: (highlights as CarFeature[]) ?? [],
    tags: (tags as string[]) ?? [],
    interiorImages: (interiorImages as string[]) ?? [],
    exteriorImages: (exteriorImages as string[]) ?? [],
    offerPictures: (offerPictures as string[]) ?? [],
  };
};

const transformPrismaTrimWithCategory = (trim: any): CarTrimWithCategory => {
  const { features, originalPrice, currentPrice, category, ...rest } = trim;

  return {
    ...rest,
    originalPrice: originalPrice.toNumber(),
    currentPrice: currentPrice.toNumber(),
    features: (features as CarFeature[]) ?? [],
    isFavorited: true,
    category: transformPrismaCategory(category),
  };
};

export async function getFavorites(userId: string): Promise<CarTrimWithCategory[]> {
  const favorites = await prisma.userFavoriteCarTrim.findMany({
    where: { userId, carTrim: { isArchived: false } },
    include: {
      carTrim: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return favorites.map((f) => transformPrismaTrimWithCategory(f.carTrim));
}

export async function addFavorite(userId: string, carTrimId: string): Promise<UserFavoriteCarTrim> {
  return prisma.userFavoriteCarTrim.create({
    data: {
      userId,
      carTrimId,
    },
  });
}

export async function removeFavorite(userId: string, carTrimId: string): Promise<UserFavoriteCarTrim | void> {
  return prisma.userFavoriteCarTrim
    .delete({
      where: {
        userId_carTrimId: {
          userId,
          carTrimId,
        },
      },
    })
    .catch(() => {
      // Ignore if not found
    });
}

export async function isFavorite(userId: string, carTrimId: string): Promise<boolean> {
  const favorite = await prisma.userFavoriteCarTrim.findUnique({
    where: {
      userId_carTrimId: {
        userId,
        carTrimId,
      },
    },
  });
  return !!favorite;
}
