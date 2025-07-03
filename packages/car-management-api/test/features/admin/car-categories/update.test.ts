import type { CarCategory } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories update", () => {
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

  it("should update a car category's prices", async () => {
    const updatePayload = {
      minPrice: 150000,
      maxPrice: 250000,
    };

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;

    expect(body.minPrice).toBe(150000);
    expect(body.maxPrice).toBe(250000);
  });

  it("should update a car category's vehicle scenario", async () => {
    const newScenario = await prisma.vehicleScenario.create({
      data: {
        name: "New Test Scenario",
        description: "New Test Scenario Description",
        image: "https://example.com/new_scenario.jpg",
        tenantId: tenantId,
      },
    });

    const updatePayload = {
      vehicleScenarioId: newScenario.id,
    };

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updatePayload),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;

    expect(body.vehicleScenario).toBeDefined();
    if (body.vehicleScenario) {
      expect(body.vehicleScenario.id).toBe(newScenario.id);
      expect(body.vehicleScenario.name).toBe("New Test Scenario");
    }
  });
}); 