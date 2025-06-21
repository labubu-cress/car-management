import type { CarTrim, User as PrismaUser, UserFavoriteCarTrim } from "@prisma/client";

export type User = PrismaUser;

export type UserWithFavorites = PrismaUser & {
  favoriteCarTrims: (UserFavoriteCarTrim & {
    carTrim: CarTrim;
  })[];
};
