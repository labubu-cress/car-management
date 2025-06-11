import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

import { prisma } from "../../db/client";
import type { JwtPayload } from "../../types/interface";

const jwtSecret = process.env.JWT_SECRET || "your-default-secret";

export const login = async (tenantId: string, openId: string, unionId?: string): Promise<string | null> => {
  let user = await prisma.user.findUnique({ where: { tenantId_openId: { tenantId, openId } } });
  if (!user) {
    user = await prisma.user.create({
      data: { tenantId, openId, unionId, nickname: "", avatarUrl: "", phoneNumber: "" },
    });
  }
  if (user) {
    const payload: JwtPayload = { id: user.id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    return token;
  }

  return null;
};

export const verify = async (token: string): Promise<User | null> => {
  const { id } = jwt.verify(token, jwtSecret) as JwtPayload;
  const user = await prisma.user.findUnique({ where: { id } });
  return user as User | null;
};
