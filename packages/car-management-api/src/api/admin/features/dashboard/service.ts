import { prisma } from "@/lib/db";

export const getDashboardStats = async (tenantId: string) => {
  const usersCount = await prisma.user.count({
    where: {
      tenantId,
    },
  });

  const carCategoriesCount = await prisma.carCategory.count({
    where: {
      tenantId,
    },
  });

  const carTrimsCount = await prisma.carTrim.count({
    where: {
      tenantId,
    },
  });

  const vehicleScenariosCount = await prisma.vehicleScenario.count({
    where: {
      tenantId,
    },
  });

  const pendingUserMessagesCount = await prisma.userMessage.count({
    where: {
      tenantId,
      status: "PENDING",
    },
  });

  const processedUserMessagesCount = await prisma.userMessage.count({
    where: {
      tenantId,
      status: "PROCESSED",
    },
  });

  const favoritesCount = await prisma.userFavoriteCarTrim.count({
    where: {
      user: {
        tenantId,
      }
    }
  });

  return {
    usersCount,
    carCategoriesCount,
    carTrimsCount,
    vehicleScenariosCount,
    pendingUserMessagesCount,
    processedUserMessagesCount,
    favoritesCount,
  };
};
