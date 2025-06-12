import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

import { prisma } from "../../db/client";
import type { AppJwtPayload } from "../../types/interface";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

export const login = async (
  tenantId: string,
  openId: string,
  unionId?: string,
): Promise<{ token: string; user: User } | null> => {
  let user = await prisma.user.findUnique({ where: { tenantId_openId: { tenantId, openId } } });
  if (!user) {
    user = await prisma.user.create({
      data: { tenantId, openId, unionId, nickname: "", avatarUrl: "", phoneNumber: "" },
    });
  }
  if (user) {
    const payload: AppJwtPayload = { id: user.id, tenantId, openId };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    return { token, user };
  }

  return null;
};

export const verify = async (token: string): Promise<User | null> => {
  const { id } = jwt.verify(token, jwtSecret) as AppJwtPayload;
  const user = await prisma.user.findUnique({ where: { id } });
  return user as User | null;
};
