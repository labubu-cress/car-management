import app from "@/index";
import { prisma } from "@/lib/db";
import type { CarCategory } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/car-categories", () => {
  let tenant: TestTenant;
  let vehicleScenarioId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario App",
        description: "Test Scenario Description App",
        image: "https://example.com/scenario-app.jpg",
        tenantId: tenant.id,
      },
    });
    vehicleScenarioId = scenario.id;

    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category App",
        tenantId: tenant.id,
        image: "https://example.com/image-app.jpg",
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

  it("should get all car categories for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-categories`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Category App");
    expect(body[0].tenantId).toBe(tenant.id);
  });

  it("should get a car category by id for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-categories/${categoryId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;
    expect(body.id).toBe(categoryId);
    expect(body.name).toBe("Test Category App");
    expect(body.tenantId).toBe(tenant.id);
  });
});
