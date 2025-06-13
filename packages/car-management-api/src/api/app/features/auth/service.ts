import type { AppJwtPayload } from "@/api/app/middleware/auth";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

export const loginOrRegister = async (
  tenantId: string,
  openId: string,
  unionId?: string,
): Promise<{ token: string; user: User }> => {
  let user = await prisma.user.findUnique({ where: { tenantId_openId: { tenantId, openId } } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        tenantId,
        openId,
        unionId,
        nickname: `用户${openId.slice(-4)}`,
        avatarUrl: "",
        phoneNumber: "",
      },
    });
  }

  const payload: AppJwtPayload = { id: user.id, tenantId, openId };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "30d" });
  return { token, user };
};

export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const { id } = jwt.verify(token, jwtSecret) as AppJwtPayload;
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    return null;
  }
};
