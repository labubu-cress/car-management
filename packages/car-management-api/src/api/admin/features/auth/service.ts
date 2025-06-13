import type { AdminJwtPayload } from "@/api/admin/middleware/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/transform";
import type { AdminUser } from "@prisma/client";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

// Helper to remove password hash
const excludePasswordHash = (user: AdminUser): Omit<AdminUser, "passwordHash"> => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; user: Omit<AdminUser, "passwordHash"> } | null> => {
  const user = await prisma.adminUser.findUnique({ where: { username } });

  if (user && verifyPassword(password, user.passwordHash)) {
    const payload: AdminJwtPayload = { id: user.id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "24h" }); // Extended token validity
    return { token, user: excludePasswordHash(user) };
  }

  return null;
};

export const verifyToken = async (token: string): Promise<Omit<AdminUser, "passwordHash"> | null> => {
  try {
    const { id } = jwt.verify(token, jwtSecret) as AdminJwtPayload;
    const user = await prisma.adminUser.findUnique({ where: { id } });
    return user ? excludePasswordHash(user) : null;
  } catch (error) {
    return null; // Token is invalid or expired
  }
};
