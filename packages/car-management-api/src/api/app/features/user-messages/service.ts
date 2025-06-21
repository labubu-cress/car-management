import { prisma } from '@/lib/db';
import type { Tenant, User } from '@prisma/client';
import { z } from 'zod';
import { CreateUserMessageSchema } from './schema';

export async function createUserMessage(
  data: z.infer<typeof CreateUserMessageSchema>,
  tenant: Tenant,
  user: User,
) {
  return prisma.userMessage.create({
    data: {
      ...data,
      tenantId: tenant.id,
      userId: user.id,
    },
  });
} 