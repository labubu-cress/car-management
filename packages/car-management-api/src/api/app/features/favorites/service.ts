import { prisma } from "@/lib/db";
import type { UserFavoriteCarTrim } from "@prisma/client";
import type { CarCategory } from "../car-categories/types";
import type { CarFeature } from "../shared/schema";
import type { FavoriteCarTrim } from "./types";

// This is getting repetitive. Maybe I should have a transformer file.
const transformPrismaCategory = (category: any, trimIsArchived: boolean): CarCategory => {
  const { highlights, tags, interiorImages, exteriorImages, offerPictures, minPrice, maxPrice, ...rest } = category;
  return {
    ...rest,
    minPrice: minPrice.toNumber(),
    maxPrice: maxPrice.toNumber(),
    isArchived: trimIsArchived, // Best effort approximation
    highlights: (highlights as CarFeature[]) ?? [],
    tags: (tags as string[]) ?? [],
    interiorImages: (interiorImages as string[]) ?? [],
    exteriorImages: (exteriorImages as string[]) ?? [],
    offerPictures: (offerPictures as string[]) ?? [],
  };
};

const transformPrismaTrimWithCategory = (trim: any): FavoriteCarTrim => {
  const { features, originalPrice, currentPrice, category, ...rest } = trim;

  const newCategory = transformPrismaCategory(category, trim.isArchived) as any;
  if (category.vehicleScenario) {
    newCategory.vehicleScenario = {
      id: category.vehicleScenario.id,
      name: category.vehicleScenario.name,
    };
  }

  return {
    ...rest,
    originalPrice: originalPrice.toNumber(),
    currentPrice: currentPrice.toNumber(),
    features: (features as CarFeature[]) ?? [],
    isFavorited: true,
    category: newCategory,
  };
};

export async function getFavorites(userId: string): Promise<FavoriteCarTrim[]> {
  const favorites = await prisma.userFavoriteCarTrim.findMany({
    where: { userId },
    include: {
      carTrim: {
        include: {
          category: {
            include: {
              vehicleScenario: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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
