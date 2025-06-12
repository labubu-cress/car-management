import type { AdminUser } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/client";
import type { AdminJwtPayload } from "../../types/interface";
import { verifyPassword } from "../../utils/transform";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

export const login = async (username: string, password: string): Promise<{ token: string; user: AdminUser } | null> => {
  const user = await prisma.adminUser.findUnique({ where: { username } });

  if (user && verifyPassword(password, user.passwordHash)) {
    const payload: AdminJwtPayload = { id: user.id };
    // 是不是因该把 tenantId 也放进去？
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    return { token, user };
  }

  return null;
};

export const verify = async (token: string): Promise<AdminUser | null> => {
  const { id } = jwt.verify(token, jwtSecret) as AdminJwtPayload;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user as AdminUser | null;
};
