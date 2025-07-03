import type { CarTrim } from "@/api/app/features/car-trims/types";
import app from "@/index";
import { prisma } from "@/lib/db";
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
        configImageUrl: "https://example.com/config-image-app.jpg",
        originalPrice: 100000,
        currentPrice: 90000,
        priceOverrideText: "Contact us for price",
        features: [{ title: "Test Feature", icon: "test_icon.jpg" }],
        categoryId: categoryId,
        tenantId: tenant.id,
        displayOrder: 1,
      },
    });
    trimId = trim.id;
  });

  it("should get all car trims for a category for the tenant", async () => {
    // Also create a trim without configImageUrl to test both cases
    await prisma.carTrim.create({
      data: {
        name: "Test Trim App 2",
        subtitle: "Subtitle for App Trim 2",
        originalPrice: 110000,
        currentPrice: 100000,
        features: [],
        categoryId: categoryId,
        tenantId: tenant.id,
      },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims?categoryId=${categoryId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);

    const trimWithConfig = body.find((t) => t.name === "Test Trim App");
    expect(trimWithConfig).toBeDefined();
    expect(trimWithConfig?.configImageUrl).toBe("https://example.com/config-image-app.jpg");
    expect(trimWithConfig?.categoryId).toBe(categoryId);
    expect(trimWithConfig?.tenantId).toBe(tenant.id);
    expect(trimWithConfig?.priceOverrideText).toBe("Contact us for price");

    const trimWithoutConfig = body.find((t) => t.name === "Test Trim App 2");
    expect(trimWithoutConfig).toBeDefined();
    expect(trimWithoutConfig?.configImageUrl).toBeNull();
  });

  it("should return car trims sorted by displayOrder", async () => {
    // Create more trims with different display orders
    await prisma.carTrim.create({
      data: {
        name: "Trim Last",
        subtitle: "Subtitle",
        originalPrice: 10000,
        currentPrice: 9000,
        features: [],
        categoryId: categoryId,
        tenantId: tenant.id,
        displayOrder: 2,
      },
    });
    const firstTrim = await prisma.carTrim.create({
      data: {
        name: "Trim First",
        subtitle: "Subtitle",
        originalPrice: 10000,
        currentPrice: 9000,
        features: [],
        categoryId: categoryId,
        tenantId: tenant.id,
        displayOrder: 0,
      },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims?categoryId=${categoryId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(3);
    expect(body[0].name).toBe("Trim First");
    expect(body[0].id).toBe(firstTrim.id);
    expect(body[1].name).toBe("Test Trim App");
    expect(body[1].id).toBe(trimId);
    expect(body[2].name).toBe("Trim Last");
  });

  it("should get a car trim by id for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims/${trimId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim;
    expect(body.id).toBe(trimId);
    expect(body.name).toBe("Test Trim App");
    expect(body.configImageUrl).toBe("https://example.com/config-image-app.jpg");
    expect(body.priceOverrideText).toBe("Contact us for price");
    expect(body.categoryId).toBe(categoryId);
    expect(body.tenantId).toBe(tenant.id);
    expect(body.features).toEqual([{ title: "Test Feature", icon: "test_icon.jpg" }]);
  });

  it("should not get archived car trims in the list", async () => {
    // Archive one of the trims
    await prisma.carTrim.create({
      data: {
        name: "Archived Trim",
        subtitle: "This one is archived",
        originalPrice: 120000,
        currentPrice: 110000,
        features: [],
        categoryId: categoryId,
        tenantId: tenant.id,
        isArchived: true,
      },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims?categoryId=${categoryId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Trim App");
  });

  it("should not get an archived car trim by id", async () => {
    // Archive the existing trim
    await prisma.carTrim.update({
      where: { id: trimId },
      data: { isArchived: true },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/car-trims/${trimId}`);
    expect(response.status).toBe(404);
  });
});
