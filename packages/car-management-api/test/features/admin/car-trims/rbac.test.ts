import type { CarTrim, CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims RBAC for TENANT_VIEWER", () => {
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;
  let trimId: string;

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
        tenantId,
      },
    });
    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category",
        image: "https://example.com/image.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        tenantId,
        vehicleScenarioId: scenario.id,
      },
    });
    categoryId = category.id;
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim",
        subtitle: "A nice trim",
        image: "https://example.com/image.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
        features: [],
        categoryId,
        tenantId,
      },
    });
    trimId = trim.id;
  });

  it("should allow getting all car trims for a category", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims?categoryId=${categoryId}`, {
      headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(trimId);
  });

  it("should allow getting a car trim by id", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimId}`, {
      headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim;
    expect(body.id).toBe(trimId);
  });

  it("should forbid creating a new car trim", async () => {
    const newTrim: CreateCarTrimInput = {
      name: "Forbidden Trim",
      subtitle: "subtitle",
      image: "https://example.com/image.jpg",
      originalPrice: 1,
      currentPrice: 1,
      features: [],
      categoryId,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tenantViewerUser.token}` },
      body: JSON.stringify(newTrim),
    });
    expect(response.status).toBe(403);
  });

  it("should forbid updating a car trim", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tenantViewerUser.token}` },
      body: JSON.stringify({ name: "New Name" }),
    });
    expect(response.status).toBe(403);
  });

  it("should forbid reordering car trims", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tenantViewerUser.token}` },
      body: JSON.stringify({ categoryId, trimIds: [trimId] }),
    });
    expect(response.status).toBe(403);
  });

  it("should forbid deleting a car trim", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
    });
    expect(response.status).toBe(403);
  });
});
