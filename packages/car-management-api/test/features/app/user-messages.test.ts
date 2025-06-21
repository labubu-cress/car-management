import app from '@/index';
import { prisma } from '@/lib/db';
import type { UserMessage } from '@prisma/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { clearTestDb, createTestTenant, createTestUser, getTestAppUserToken, type TestTenant, type TestUser } from '../../helper';

describe('App API: /api/v1/app/user-messages', () => {
  let tenant: TestTenant;
  let user: TestUser;
  let token = '';

  beforeAll(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    user = await createTestUser(prisma, tenant.id);
    token = await getTestAppUserToken(user);
  });

  afterEach(async () => {
    await prisma.userMessage.deleteMany();
  });

  it('should create a new user message', async () => {
    const messageData = {
      name: 'Test User',
      contact: '1234567890',
      content: 'This is a test message.',
    };

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/user-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    expect(response.status).toBe(200);
    const createdMessage = (await response.json()) as UserMessage;

    expect(createdMessage).toBeDefined();
    expect(createdMessage.name).toBe(messageData.name);
    expect(createdMessage.contact).toBe(messageData.contact);
    expect(createdMessage.content).toBe(messageData.content);
    expect(createdMessage.tenantId).toBe(tenant.id);
    expect(createdMessage.userId).toBe(user.id);

    const dbMessage = await prisma.userMessage.findUnique({ where: { id: createdMessage.id } });
    expect(dbMessage).not.toBeNull();
    expect(dbMessage?.name).toBe(messageData.name);
  });
}); 