import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserMessageQuerySchema } from './schema';

export const find = async (tenantId: string, { page, pageSize }: z.infer<typeof UserMessageQuerySchema>) => {
  const [messages, total] = await prisma.$transaction([
    prisma.userMessage.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            nickname: true,
            avatarUrl: true,
            phoneNumber: true,
            createdAt: true,
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.userMessage.count({ where: { tenantId } }),
  ]);
  return { messages, total };
}; 