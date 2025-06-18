import app from "@/index";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/users", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));
  });

  it("should get all users for the tenant", async () => {
    // Create a user for the tenant
    await prisma.user.create({
      data: {
        openId: "test-user-openid-for-getall",
        nickname: "Test User",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678901",
        tenantId: tenantId,
      },
    });

    // Create a user for another tenant to ensure filtering
    const otherTenant = await prisma.tenant.create({
      data: {
        name: "Other Tenant",
        appId: "other-app-id",
        appSecret: "other-app-secret",
      },
    });
    await prisma.user.create({
      data: {
        openId: "other-tenant-user-openid",
        nickname: "Other Tenant User",
        avatarUrl: "avatar.jpg",
        phoneNumber: "1112223333",
        tenantId: otherTenant.id,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as User[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1); // Should only get user for its own tenant
    expect(body[0].nickname).toBe("Test User");
  });

  it("should get a user by id", async () => {
    const user = await prisma.user.create({
      data: {
        openId: "test-user-openid-for-get-by-id",
        nickname: "Test User for Get By Id",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678902",
        tenantId: tenantId,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as User;
    expect(Array.isArray(body)).toBe(false);
    expect(body.id).toBe(user.id);
    expect(body.nickname).toBe("Test User for Get By Id");
  });
});
