import app from "@/index";
import { prisma } from "@/lib/db";
import type { CarTrim } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/car-trims", () => {
  let tenant: TestTenant;
  let categoryId: string;
  let trimId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario App For Trims",
        description: "Test Scenario Description App For Trims",
        image: "https://example.com/scenario-app-trims.jpg",
        tenantId: tenant.id,
      },
    });

    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category App For Trims",
        tenantId: tenant.id,
        image: "https://example.com/image-app-trims.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        vehicleScenarioId: scenario.id,
      },
    });
    categoryId = category.id;

    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim App",
        subtitle: "Subtitle for App Trim",
        image: "https://example.com/trim-app.jpg",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
        categoryId: categoryId,
        tenantId: tenant.id,
      },
    });
    trimId = trim.id;
  });

  it("should get all car trims for a category for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims?categoryId=${categoryId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Trim App");
    expect(body[0].categoryId).toBe(categoryId);
    expect(body[0].tenantId).toBe(tenant.id);
  });

  it("should get a car trim by id for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims/${trimId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim;
    expect(body.id).toBe(trimId);
    expect(body.name).toBe("Test Trim App");
    expect(body.categoryId).toBe(categoryId);
    expect(body.tenantId).toBe(tenant.id);
  });
});
