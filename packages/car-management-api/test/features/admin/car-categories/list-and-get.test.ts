import type { CarCategory } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories list and get", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let vehicleScenarioId: string;
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
    vehicleScenarioId = scenario.id;

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
        vehicleScenarioId: vehicleScenarioId,
      },
    });
    categoryId = category.id;
  });

  it("should get all car categories", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Category");
    expect(body[0].minPrice).toBe(0);
    expect(body[0].maxPrice).toBe(0);
  });

  it("should get a car category by id", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;
    expect(body.id).toBe(categoryId);
    expect(body.name).toBe("Test Category");
    expect(body.minPrice).toBe(0);
    expect(body.maxPrice).toBe(0);
  });
}); 