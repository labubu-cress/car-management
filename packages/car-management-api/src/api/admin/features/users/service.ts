import { prisma } from "@/lib/db";
import type { User, UserWithFavorites } from "./types";

export const getAllUsers = async (tenantId: string): Promise<User[]> => {
  return prisma.user.findMany({
    where: { tenantId },
  });
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
          carTrim: true,
        },
      },
    },
  });
};
