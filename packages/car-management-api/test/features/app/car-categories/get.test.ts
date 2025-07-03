import type { CarCategory } from "@/api/app/features/car-categories/types";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/car-categories/:id", () => {
  let tenant: TestTenant;
  let vehicleScenarioId: string;

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
  });

  it("should get a car category by id and compute isArchived, minPrice, maxPrice", async () => {
    // Category with active trim
    const categoryActive = await prisma.carCategory.create({
      data: {
        name: "Active Category",
        tenantId: tenant.id,
        image: "img",
        vehicleScenarioId: vehicleScenarioId,
        minPrice: 95,
        maxPrice: 205,
        tags: [],
        highlights: [{ title: "Test Highlight", icon: "test_icon.jpg" }],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim Active",
        tenantId: tenant.id,
        categoryId: categoryActive.id,
        isArchived: false,
        subtitle: "s",
        image: "i",
        originalPrice: 100,
        currentPrice: 100,
        features: [],
      },
    });

    await prisma.carTrim.create({
      data: {
        name: "Trim Active 2",
        tenantId: tenant.id,
        categoryId: categoryActive.id,
        isArchived: false,
        subtitle: "s",
        image: "i",
        originalPrice: 200,
        currentPrice: 200,
        features: [],
      },
    });

    // Category with only archived trims
    const categoryArchived = await prisma.carCategory.create({
      data: {
        name: "Archived Category",
        tenantId: tenant.id,
        image: "img",
        vehicleScenarioId: vehicleScenarioId,
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim Archived",
        tenantId: tenant.id,
        categoryId: categoryArchived.id,
        isArchived: true,
        subtitle: "s",
        image: "i",
        originalPrice: 300,
        currentPrice: 300,
        features: [],
      },
    });

    const responseActive = await app.request(
      `/api/v1/app/tenants/${tenant.id}/car-categories/${categoryActive.id}`,
    );
    expect(responseActive.status).toBe(200);
    const bodyActive = (await responseActive.json()) as CarCategory;
    expect(bodyActive.name).toBe("Active Category");
    expect(bodyActive.minPrice).toBe(95);
    expect(bodyActive.maxPrice).toBe(205);
    expect(bodyActive.isArchived).toBe(false);

    // Should not be able to get archived category
    const responseArchived = await app.request(
      `/api/v1/app/tenants/${tenant.id}/car-categories/${categoryArchived.id}`,
    );
    expect(responseArchived.status).toBe(404);
  });
}); 