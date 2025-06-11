import type { AdminUser } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/client";
import type { JwtPayload } from "../../types/interface";
import { verifyPassword } from "../../utils/transform";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

export const login = async (
  username: string,
  password: string
): Promise<string | null> => {
  const user = await prisma.adminUser.findUnique({ where: { username } });

  if (user && verifyPassword(password, user.passwordHash)) {
    const payload: JwtPayload = { id: user.id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    return token;
  }

  return null;
};

export const verify = async (token: string): Promise<AdminUser | null> => {
  const { id } = jwt.verify(token, jwtSecret) as JwtPayload;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user as AdminUser | null;
};
