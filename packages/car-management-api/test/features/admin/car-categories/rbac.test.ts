import type { CarCategory, CreateCarCategoryInput } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories for TENANT_VIEWER", () => {
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;
  let vehicleScenarioId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const result = await createTestTenantAndAdminUsers(prisma);
    tenantId = result.tenantId;
    tenantViewerUser = result.tenantViewerUser;

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

  it("should allow TENANT_VIEWER to get all car categories", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      headers: {
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory[];
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Category");
  });

  it("should allow TENANT_VIEWER to get a car category by id", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;
    expect(body.id).toBe(categoryId);
  });

  it("should forbid TENANT_VIEWER from creating a new car category", async () => {
    const newCategory: CreateCarCategoryInput = {
      name: "Forbidden Category",
      image: "image.jpg",
      minPrice: 1,
      maxPrice: 2,
      tags: [],
      highlights: [],
      interiorImages: [],
      exteriorImages: [],
      offerPictures: [],
      vehicleScenarioId: vehicleScenarioId,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
      body: JSON.stringify(newCategory),
    });
    expect(response.status).toBe(403);
  });

  it("should forbid TENANT_VIEWER from updating a car category", async () => {
    const updatePayload = { name: "Updated Name" };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
      body: JSON.stringify(updatePayload),
    });
    expect(response.status).toBe(403);
  });

  it("should forbid TENANT_VIEWER from deleting a car category", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
    });
    expect(response.status).toBe(403);
  });

  it("should forbid TENANT_VIEWER from reordering categories", async () => {
    const reorderPayload = {
      vehicleScenarioId,
      categoryIds: [categoryId],
    };
    const reorderResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenantViewerUser.token}`,
      },
      body: JSON.stringify(reorderPayload),
    });
    expect(reorderResponse.status).toBe(403);
  });
});
