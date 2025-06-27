import type { CarCategory } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories isArchived logic", () => {
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

  it("should return isArchived: false when category has no trims", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    const body = (await response.json()) as CarCategory;
    expect(body.isArchived).toBe(false);
  });

  it("should calculate isArchived correctly based on trims", async () => {
    // Setup: 2 trims, one archived, one not
    await prisma.carTrim.create({
      data: {
        name: "Trim 1",
        subtitle: "Test Subtitle",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
        isArchived: true,
        categoryId: categoryId,
        tenantId: tenantId,
        image: "https://example.com/trim1.jpg",
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 2",
        subtitle: "Test Subtitle",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
        isArchived: false,
        categoryId: categoryId,
        tenantId: tenantId,
        image: "https://example.com/trim2.jpg",
      },
    });

    let response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    let body = (await response.json()) as CarCategory;
    expect(body.isArchived).toBe(false);

    // Setup: both trims archived
    await prisma.carTrim.updateMany({
      where: { categoryId: categoryId },
      data: { isArchived: true },
    });

    response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    body = (await response.json()) as CarCategory;
    expect(body.isArchived).toBe(true);
  });

  it("should update all trims when category isArchived is updated", async () => {
    // Setup: 2 trims, both not archived
    await prisma.carTrim.create({
      data: {
        name: "Trim 1",
        subtitle: "Test Subtitle",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
        isArchived: false,
        categoryId: categoryId,
        tenantId: tenantId,
        image: "https://example.com/trim1.jpg",
      },
    });
    await prisma.carTrim.create({
      data: {
        name: "Trim 2",
        subtitle: "Test Subtitle",
        originalPrice: 100000,
        currentPrice: 90000,
        features: [],
        isArchived: false,
        categoryId: categoryId,
        tenantId: tenantId,
        image: "https://example.com/trim2.jpg",
      },
    });

    // Update category to be archived
    const updatePayload = { isArchived: true };
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
    expect(body.isArchived).toBe(true);

    const trims = await prisma.carTrim.findMany({ where: { categoryId: categoryId } });
    expect(trims.length).toBe(2);
    expect(trims.every((t) => t.isArchived)).toBe(true);

    // Update category to be un-archived
    const updatePayload2 = { isArchived: false };
    const response2 = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updatePayload2),
    });
    expect(response2.status).toBe(200);
    const body2 = (await response2.json()) as CarCategory;
    expect(body2.isArchived).toBe(false);

    const trims2 = await prisma.carTrim.findMany({ where: { categoryId: categoryId } });
    expect(trims2.every((t) => !t.isArchived)).toBe(true);
  });
});
