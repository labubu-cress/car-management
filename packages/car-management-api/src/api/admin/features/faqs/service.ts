import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateFaqSchema, UpdateFaqSchema } from './schema';

export const find = async (tenantId: string, { page, pageSize }: { page: number, pageSize: number }) => {
  const [faqs, total] = await prisma.$transaction([
    prisma.faq.findMany({
      where: { tenantId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.faq.count({ where: { tenantId } }),
  ]);
  return { faqs, total };
};

export const findById = (tenantId: string, id: string) => {
  return prisma.faq.findFirst({ where: { id, tenantId } });
}

export const create = (tenantId: string, data: z.infer<typeof CreateFaqSchema>) => {
  return prisma.faq.create({
    data: {
      ...data,
      tenantId,
    },
  });
};

export const update = (tenantId: string, id: string, data: z.infer<typeof UpdateFaqSchema>) => {
  return prisma.faq.update({
    where: { id, tenantId },
    data,
  });
};

export const remove = (tenantId: string, id: string) => {
  return prisma.faq.delete({ where: { id, tenantId } });
}; 