import app from '@/index';
import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from '../../helper';

describe('Admin API: /api/v1/admin/tenants/:tenantId/user-messages', () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));
  });

  it('should get all user messages', async () => {
    await prisma.userMessage.create({
      data: {
        name: 'John Doe',
        contact: 'john.doe@example.com',
        content: 'This is a test message.',
        tenantId: tenantId,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.total).toBe(1);
    expect(body.items.some((s: any) => s.name === 'John Doe')).toBe(true);
  });
}); 