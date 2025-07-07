import { prisma } from "@/lib/db";
import type { User, UserWithFavorites } from "./types";

export const getAllUsers = async (tenantId: string): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          favoriteCarTrims: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map(user => {
    const { _count, ...rest } = user;
    return {
      ...rest,
      favoritesCount: _count?.favoriteCarTrims ?? 0,
    }
  })
};

export const getUserById = async (
  tenantId: string,
  id: string,
): Promise<UserWithFavorites | null> => {
  return prisma.user.findUnique({
    where: { id, tenantId },
    include: {
      favoriteCarTrims: {
        include: {
          carTrim: {
            include: {
              category: {
                include: {
                  vehicleScenario: true,
                },
              },
            },
          },
        },
      },
    },
  });
};
