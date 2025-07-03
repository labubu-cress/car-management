import type { CarTrim } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims LIST & REORDER", () => {
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

  it("should get all car trims for a category, sorted by displayOrder", async () => {
    await prisma.carTrim.create({
      data: {
        name: "Trim 2",
        subtitle: "A nice trim",
        configImageUrl: "https://example.com/trim2-config.jpg",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
        displayOrder: 1,
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 1",
        subtitle: "A nice trim",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
        displayOrder: 0,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims?categoryId=${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0].name).toBe("Trim 1");
    expect(body[0].configImageUrl).toBeNull();
    expect(body[1].name).toBe("Trim 2");
    expect(body[1].configImageUrl).toBe("https://example.com/trim2-config.jpg");
  });

  it("should reorder car trims", async () => {
    const trim1 = await prisma.carTrim.create({
      data: {
        name: "Trim 1",
        subtitle: "A nice trim",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
        displayOrder: 0,
      },
    });
    const trim2 = await prisma.carTrim.create({
      data: {
        name: "Trim 2",
        subtitle: "A nice trim",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
        displayOrder: 1,
      },
    });

    const newOrderIds = [trim2.id, trim1.id];
    const reorderResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify({ categoryId: categoryId, trimIds: newOrderIds }),
    });
    expect(reorderResponse.status).toBe(204);

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims?categoryId=${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    const body = (await response.json()) as CarTrim[];
    expect(body.length).toBe(2);
    expect(body[0].id).toBe(trim2.id);
    expect(body[1].id).toBe(trim1.id);
    expect(body[0].displayOrder).toBe(0);
    expect(body[1].displayOrder).toBe(1);
  });
}); 