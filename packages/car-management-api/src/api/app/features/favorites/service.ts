import { prisma } from '@/lib/db';
import type { CarCategory, CarTrim, UserFavoriteCarTrim } from '@prisma/client';

type CarTrimWithDetails = CarTrim & { category: CarCategory };

export async function getFavorites(userId: string): Promise<CarTrimWithDetails[]> {
  const favorites = await prisma.userFavoriteCarTrim.findMany({
    where: { userId },
    include: {
      carTrim: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return favorites.map((f) => f.carTrim as CarTrimWithDetails);
}

export async function addFavorite(userId:string, carTrimId: string): Promise<UserFavoriteCarTrim> {
  return prisma.userFavoriteCarTrim.create({
    data: {
      userId,
      carTrimId,
    },
  });
}

export async function removeFavorite(userId: string, carTrimId: string): Promise<UserFavoriteCarTrim | void> {
  return prisma.userFavoriteCarTrim.delete({
    where: {
      userId_carTrimId: {
        userId,
        carTrimId,
      },
    },
  }).catch(() => {
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