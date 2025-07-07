import type { CarCategory, CarTrim, User as PrismaUser, UserFavoriteCarTrim, VehicleScenario } from "@prisma/client";

export type User = PrismaUser & {
  favoritesCount?: number;
};

export type UserWithFavorites = PrismaUser & {
  favoriteCarTrims: (UserFavoriteCarTrim & {
    carTrim: CarTrim & {
      category: CarCategory & {
        vehicleScenario: VehicleScenario;
      };
    };
  })[];
};
