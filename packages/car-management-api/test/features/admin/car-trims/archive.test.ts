import type { CarTrim, CarTrimWithFavorites } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims Archive", () => {
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

  it("should archive and unarchive a car trim", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Update",
        subtitle: "Initial subtitle",
        image: "https://example.com/trim_initial.jpg",
        originalPrice: 60000,
        currentPrice: 55000,
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });

    // Archive the car trim
    const archiveUpdateData = { isArchived: true };
    let response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(archiveUpdateData),
    });
    expect(response.status).toBe(200);
    let body = (await response.json()) as CarTrim;
    expect(body.isArchived).toBe(true);

    // Verify it's archived in the DB
    let updatedTrim = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrim?.isArchived).toBe(true);

    // Unarchive the car trim
    const unarchiveUpdateData = { isArchived: false };
    response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(unarchiveUpdateData),
    });
    expect(response.status).toBe(200);
    body = (await response.json()) as CarTrim;
    expect(body.isArchived).toBe(false);

    // Verify it's unarchived in the DB
    updatedTrim = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrim?.isArchived).toBe(false);
  });

  it("should return isArchived status when getting a single trim", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim",
        subtitle: "A nice trim",
        image: "https://example.com/image.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
        features: [],
        categoryId,
        tenantId,
        isArchived: true,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    const body = (await response.json()) as CarTrimWithFavorites;
    expect(body.isArchived).toBe(true);
  });
});
