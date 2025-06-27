import type { UserWithFavorites } from "@/api/admin/features/users/types";
import app from "@/index";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/users", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
    tenantId = setup.tenantId;
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

  it("should get a user by id with favorite car trims", async () => {
    const scenario = await prisma.vehicleScenario.create({
      data: {
        tenantId,
        name: "Test Scenario",
        description: "Test Scenario",
        image: "image.jpg",
      },
    });

    const category = await prisma.carCategory.create({
      data: {
        tenantId,
        vehicleScenarioId: scenario.id,
        name: "Test Category",
        image: "image.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });

    const trim = await prisma.carTrim.create({
      data: {
        tenantId,
        categoryId: category.id,
        name: "Test Trim",
        subtitle: "Test Subtitle",
        image: "image.jpg",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
      },
    });

    const user = await prisma.user.create({
      data: {
        openId: "test-user-openid-for-get-by-id",
        nickname: "Test User for Get By Id",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678902",
        tenantId: tenantId,
      },
    });

    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: trim.id,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as UserWithFavorites;
    expect(Array.isArray(body)).toBe(false);
    expect(body.id).toBe(user.id);
    expect(body.nickname).toBe("Test User for Get By Id");
    expect(body.favoriteCarTrims).toBeDefined();
    expect(Array.isArray(body.favoriteCarTrims)).toBe(true);
    expect(body.favoriteCarTrims.length).toBe(1);
    expect(body.favoriteCarTrims[0].carTrimId).toBe(trim.id);
    expect(body.favoriteCarTrims[0].carTrim.name).toBe("Test Trim");
  });

  describe("as tenant_viewer", () => {
    it("should get all users for the tenant", async () => {
      await prisma.user.create({
        data: {
          openId: "test-user-openid-for-viewer",
          nickname: "Test User",
          avatarUrl: "avatar.jpg",
          phoneNumber: "12345678901",
          tenantId: tenantId,
        },
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users`, {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as User[];
      expect(body.length).toBe(1);
    });

    it("should get a user by id", async () => {
      const user = await prisma.user.create({
        data: {
          openId: "test-user-openid-for-viewer-get-by-id",
          nickname: "Test User for Get By Id",
          avatarUrl: "avatar.jpg",
          phoneNumber: "12345678902",
          tenantId: tenantId,
        },
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as UserWithFavorites;
      expect(body.id).toBe(user.id);
    });
  });
});
