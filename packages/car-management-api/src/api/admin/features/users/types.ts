import type { CarTrim, User as PrismaUser, UserFavoriteCarTrim } from "@prisma/client";

export type User = PrismaUser & {
  favoritesCount?: number;
};

export type UserWithFavorites = PrismaUser & {
  favoriteCarTrims: (UserFavoriteCarTrim & {
    carTrim: CarTrim;
  })[];
};
