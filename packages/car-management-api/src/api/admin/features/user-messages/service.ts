import { prisma } from "@/lib/db";
import createError from "http-errors";
import { z } from "zod";
import { UserMessageQuerySchema } from "./schema";

export const find = async (tenantId: string, { page, pageSize, status }: z.infer<typeof UserMessageQuerySchema>) => {
  const where = { tenantId, status };
  const [messagesFromDb, total] = await prisma.$transaction([
    prisma.userMessage.findMany({
      where,
      include: {
        user: {
          select: {
            nickname: true,
            avatarUrl: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
        processedBy: {
          select: {
            username: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.userMessage.count({ where }),
  ]);

  const messages = messagesFromDb.map(({ phone, message, ...rest }) => ({
    ...rest,
    contact: phone,
    content: message,
  }));

  return { messages, total };
};

export const process = async (id: string, adminUserId: string) => {
  const message = await prisma.userMessage.findUnique({
    where: { id },
  });

  if (!message) {
    throw createError(404, "User message not found");
  }

  if (message.status === "PROCESSED") {
    throw createError(400, "User message already processed");
  }

  return await prisma.userMessage.update({
    where: { id },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      processedById: adminUserId,
    },
  });
};
