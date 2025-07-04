import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, createTestUser, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/dashboard", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
    tenantId = setup.tenantId;

    // Create some sample data for stats
    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario",
        description: "Test Scenario Description",
        image: "https://example.com/scenario.jpg",
        tenantId,
      },
    });
    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category",
        image: "https://example.com/image.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        tenantId,
        vehicleScenarioId: scenario.id,
      },
    });
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim",
        subtitle: "A nice trim",
        originalPrice: 50000,
        currentPrice: 48000,
        features: [],
        categoryId: category.id,
        tenantId,
      },
    });
    const user = await createTestUser(prisma, tenantId);
    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: trim.id,
      },
    });
    await prisma.userMessage.create({
      data: {
        tenantId,
        name: "Test User",
        phone: "1234567890",
        message: "This is a test message.",
        userId: user.id,
      },
    });
  });

  it("admin should be able to get dashboard stats", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      carCategoriesCount: 1,
      carTrimsCount: 1,
      usersCount: 1,
      vehicleScenariosCount: 1,
      pendingUserMessagesCount: 1,
      processedUserMessagesCount: 0,
      favoritesCount: 1,
    });
  });

  it("tenant_viewer should be able to get dashboard stats", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      carCategoriesCount: 1,
      carTrimsCount: 1,
      usersCount: 1,
      vehicleScenariosCount: 1,
      pendingUserMessagesCount: 1,
      processedUserMessagesCount: 0,
      favoritesCount: 1,
    });
  });
});
