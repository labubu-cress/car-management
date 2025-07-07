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

  it("should return users with correct favoritesCount", async () => {
    // Create a user for the tenant
    const user = await prisma.user.create({
      data: {
        openId: "test-user-with-favorites",
        nickname: "Test User Favorites",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678903",
        tenantId: tenantId,
      },
    });

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

    const trim1 = await prisma.carTrim.create({
      data: {
        tenantId,
        categoryId: category.id,
        name: "Test Trim 1",
        subtitle: "Test Subtitle 1",
        originalPrice: "100000",
        currentPrice: "90000",
        features: [],
      },
    });

    const trim2 = await prisma.carTrim.create({
      data: {
        tenantId,
        categoryId: category.id,
        name: "Test Trim 2",
        subtitle: "Test Subtitle 2",
        originalPrice: "120000",
        currentPrice: "110000",
        features: [],
      },
    });

    await prisma.userFavoriteCarTrim.createMany({
      data: [
        { userId: user.id, carTrimId: trim1.id },
        { userId: user.id, carTrimId: trim2.id },
      ],
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as (User & { favoritesCount: number })[];
    expect(body.length).toBe(1);
    const userWithFavorites = body.find(u => u.id === user.id);
    expect(userWithFavorites).toBeDefined();
    expect(userWithFavorites?.favoritesCount).toBe(2);
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
    expect(body.favoriteCarTrims[0].carTrim.category).toBeDefined();
    expect(body.favoriteCarTrims[0].carTrim.category.name).toBe("Test Category");
    expect(body.favoriteCarTrims[0].carTrim.category.vehicleScenario).toBeDefined();
    expect(body.favoriteCarTrims[0].carTrim.category.vehicleScenario.name).toBe("Test Scenario");
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
