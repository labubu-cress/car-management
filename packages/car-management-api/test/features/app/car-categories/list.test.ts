import type { CarCategory } from "@/api/app/features/car-categories/types";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/car-categories", () => {
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

  it("should return categories sorted by displayOrder and filter out archived ones", async () => {
    // Category 1: Should be returned, has one active trim
    const category1 = await prisma.carCategory.create({
      data: {
        name: "Category 1",
        tenantId: tenant.id,
        image: "img",
        displayOrder: 2,
        vehicleScenarioId: vehicleScenarioId,
        minPrice: 90,
        maxPrice: 210,
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 1-1 (Active)",
        tenantId: tenant.id,
        categoryId: category1.id,
        isArchived: false,
        subtitle: "s",
        originalPrice: 100,
        currentPrice: 100,
        features: [],
      },
    });

    await prisma.carTrim.create({
      data: {
        name: "Trim 1-2 (Active)",
        tenantId: tenant.id,
        categoryId: category1.id,
        isArchived: false,
        subtitle: "s",
        originalPrice: 200,
        currentPrice: 200,
        features: [],
      },
    });

    // Category 2: Should be returned, has one active and one archived trim
    const category2 = await prisma.carCategory.create({
      data: {
        name: "Category 2",
        tenantId: tenant.id,
        image: "img",
        displayOrder: 1,
        vehicleScenarioId: vehicleScenarioId,
        minPrice: 290,
        maxPrice: 310,
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 2-1 (Active)",
        tenantId: tenant.id,
        categoryId: category2.id,
        isArchived: false,
        subtitle: "s",
        originalPrice: 300,
        currentPrice: 300,
        features: [],
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 2-2 (Archived)",
        tenantId: tenant.id,
        categoryId: category2.id,
        isArchived: true,
        subtitle: "s",
        originalPrice: 400,
        currentPrice: 400,
        features: [],
      },
    });

    // Category 3: Should be filtered out, all trims are archived
    const category3 = await prisma.carCategory.create({
      data: {
        name: "Category 3",
        tenantId: tenant.id,
        image: "img",
        displayOrder: 3,
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
        name: "Trim 3-1 (Archived)",
        tenantId: tenant.id,
        categoryId: category3.id,
        isArchived: true,
        subtitle: "s",
        originalPrice: 500,
        currentPrice: 500,
        features: [],
      },
    });

    // Category 4: Should be filtered out, has no trims
    await prisma.carCategory.create({
      data: {
        name: "Category 4",
        tenantId: tenant.id,
        image: "img",
        displayOrder: 4,
        vehicleScenarioId: vehicleScenarioId,
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
      },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-categories`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory[];

    expect(body.length).toBe(2);
    expect(body[0].name).toBe("Category 2"); // displayOrder: 1
    expect(body[0].minPrice).toBe(290);
    expect(body[0].maxPrice).toBe(310);

    expect(body[1].name).toBe("Category 1"); // displayOrder: 2
    expect(body[1].minPrice).toBe(90);
    expect(body[1].maxPrice).toBe(210);

    expect(body[0].isArchived).toBe(false);
    expect(body[1].isArchived).toBe(false);
  });
}); 