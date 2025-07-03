import type { CarTrim, CarTrimWithFavorites } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims GET/UPDATE/DELETE", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario",
        description: "Test Scenario Description",
        image: "https://example.com/scenario.jpg",
        tenantId: tenantId,
      },
    });

    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category",
        tenantId: tenantId,
        image: "https://example.com/image.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        vehicleScenarioId: scenario.id,
      },
    });
    categoryId = category.id;
  });

  it("should get a car trim by id with users who favorited it", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Get",
        subtitle: "A nice trim",
        image: "https://example.com/trim.jpg",
        configImageUrl: "https://example.com/trim-get-config.jpg",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });

    const user = await prisma.user.create({
      data: {
        openId: "test-user-openid-for-favorite",
        nickname: "Favorite User",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678903",
        tenantId: tenantId,
      },
    });

    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: trim.id,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrimWithFavorites;
    expect(body.id).toBe(trim.id);
    expect(body.name).toBe("Test Trim for Get");
    expect(body.configImageUrl).toBe("https://example.com/trim-get-config.jpg");
    expect(body.favoritedBy).toBeDefined();
    expect(Array.isArray(body.favoritedBy)).toBe(true);
    expect(body.favoritedBy.length).toBe(1);
    expect(body.favoritedBy[0].user.id).toBe(user.id);
    expect(body.favoritedBy[0].user.nickname).toBe("Favorite User");
    expect(body.favoritedBy[0].user.openId).toBe("test-user-openid-for-favorite");
  });

  it("should delete a car trim", async () => {
    const trimToDelete = await prisma.carTrim.create({
      data: {
        name: "Trim to Delete",
        subtitle: "A trim to be deleted",
        image: "https://example.com/trim-delete.jpg",
        originalPrice: "600000",
        currentPrice: "560000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(204);

    const findResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(findResponse.status).toBe(404);
  });

  it("should update a car trim's basic information", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Update",
        subtitle: "Initial subtitle",
        image: "https://example.com/trim_initial.jpg",
        originalPrice: "60000",
        currentPrice: "55000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });

    // Update name and configImageUrl
    const updateData = { name: "Updated Trim Name", configImageUrl: "https://example.com/updated-config.jpg" };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updateData),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim;
    expect(body.name).toBe(updateData.name);
    expect(body.configImageUrl).toBe(updateData.configImageUrl);
    const updatedTrimInDb = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrimInDb?.configImageUrl).toBe(updateData.configImageUrl);
  });
}); 