import type { AdminUser as PrismaAdminUser } from "@prisma/client";

export type AdminUser = Omit<PrismaAdminUser, "passwordHash">;
