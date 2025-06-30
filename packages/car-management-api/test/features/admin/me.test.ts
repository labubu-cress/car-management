import app from '@/index';
import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    clearTestDb,
    createTestAdminUser,
    type TestAdminUserWithToken,
} from '../../helper';

describe('Admin me API', () => {
  let adminUser: TestAdminUserWithToken;

  beforeEach(async () => {
    await clearTestDb(prisma);
    adminUser = await createTestAdminUser(prisma, 'admin');
  });

  it('should allow an admin user to update their own password', async () => {
    const newPassword = 'newSecurePassword123';

    const res = await app.request('/api/v1/admin/me/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify({
        oldPassword: adminUser.password,
        newPassword: newPassword,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe('Password updated successfully');

    // Verify the new password works
    const loginRes = await app.request('/api/v1/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: adminUser.username,
        password: newPassword,
      }),
    });
    expect(loginRes.status).toBe(200);

    // Verify the old password no longer works
    const loginResOld = await app.request('/api/v1/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: adminUser.username,
        password: adminUser.password,
      }),
    });
    expect(loginResOld.status).toBe(401);
  });

  it('should return 400 for incorrect old password', async () => {
    const res = await app.request('/api/v1/admin/me/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify({
        oldPassword: 'wrongOldPassword',
        newPassword: 'aNewPassword',
      }),
    });

    expect(res.status).toBe(400);
  });
}); 