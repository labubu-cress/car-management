import type { CarCategory } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories reorder", () => {
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

  it("should correctly order categories on creation and reorder them", async () => {
    // 1. Create more categories
    const category2 = await prisma.carCategory.create({
      data: {
        name: "Category 2",
        tenantId: tenantId,
        image: "https://example.com/image2.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        vehicleScenarioId: vehicleScenarioId,
      },
    });

    const category3 = await prisma.carCategory.create({
      data: {
        name: "Category 3",
        tenantId: tenantId,
        image: "https://example.com/image3.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        vehicleScenarioId: vehicleScenarioId,
      },
    });

    // 2. Verify initial order
    const initialResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(initialResponse.status).toBe(200);
    const initialBody = (await initialResponse.json()) as CarCategory[];
    expect(initialBody.length).toBe(3);
    expect(initialBody.map((c) => c.id)).toEqual([categoryId, category2.id, category3.id]);

    // 3. Reorder the categories
    const reorderPayload = {
      vehicleScenarioId,
      categoryIds: [category3.id, categoryId, category2.id],
    };
    const reorderResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(reorderPayload),
    });
    expect(reorderResponse.status).toBe(204);

    // 4. Verify the new order
    const finalResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(finalResponse.status).toBe(200);
    const finalBody = (await finalResponse.json()) as CarCategory[];
    expect(finalBody.length).toBe(3);
    expect(finalBody.map((c) => c.id)).toEqual([category3.id, categoryId, category2.id]);
  });
}); 