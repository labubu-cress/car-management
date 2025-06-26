import type { CarCategory, CreateCarCategoryInput } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-categories", () => {
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

  it("should create a new car category", async () => {
    const newCategory: CreateCarCategoryInput = {
      name: "New Test Category",
      image: "https://example.com/new_image.jpg",
      tags: ["豪华", "舒适", "智能驾驶"],
      highlights: [
        { title: "动力系统", icon: "https://example.com/icon1.jpg" },
        { title: "燃油经济性", icon: "https://example.com/icon2.jpg" },
        { title: "最大功率", icon: "https://example.com/icon3.jpg" },
      ],
      interiorImages: [
        "https://example.com/interior1.jpg",
        "https://example.com/interior2.jpg",
        "https://example.com/interior3.jpg",
      ],
      exteriorImages: ["https://example.com/exterior1.jpg", "https://example.com/exterior2.jpg"],
      offerPictures: ["https://example.com/offer1.jpg", "https://example.com/offer2.jpg"],
      vehicleScenarioId: vehicleScenarioId,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(newCategory),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as CarCategory;

    // 验证基本信息
    expect(body).toMatchObject({
      name: newCategory.name,
      image: newCategory.image,
      tenantId: tenantId,
    });

    // 验证 tags 数组
    expect(body.tags).toBeDefined();
    expect(Array.isArray(body.tags)).toBe(true);
    expect(body.tags).toEqual(newCategory.tags);
    expect(body.tags.length).toBe(3);
    expect(body.tags).toContain("豪华");
    expect(body.tags).toContain("舒适");
    expect(body.tags).toContain("智能驾驶");

    // 验证 highlights 数组
    expect(body.highlights).toBeDefined();
    expect(Array.isArray(body.highlights)).toBe(true);
    expect(body.highlights.length).toBe(3);
    expect(body.highlights[0]).toMatchObject({ title: "动力系统", icon: "https://example.com/icon1.jpg" });
    expect(body.highlights[1]).toMatchObject({ title: "燃油经济性", icon: "https://example.com/icon2.jpg" });
    expect(body.highlights[2]).toMatchObject({ title: "最大功率", icon: "https://example.com/icon3.jpg" });

    // 验证 vehicleScenario
    expect(body.vehicleScenario).toBeDefined();
    if (body.vehicleScenario) {
      expect(body.vehicleScenario.id).toBe(vehicleScenarioId);
      expect(body.vehicleScenario.name).toBe("Test Scenario");
    }

    // 验证 interiorImages 数组
    expect(body.interiorImages).toBeDefined();
    expect(Array.isArray(body.interiorImages)).toBe(true);
    expect(body.interiorImages.length).toBe(3);
    expect(body.interiorImages).toEqual(newCategory.interiorImages);

    // 验证 exteriorImages 数组
    expect(body.exteriorImages).toBeDefined();
    expect(Array.isArray(body.exteriorImages)).toBe(true);
    expect(body.exteriorImages.length).toBe(2);
    expect(body.exteriorImages).toEqual(newCategory.exteriorImages);

    // 验证 offerPictures 数组
    expect(body.offerPictures).toBeDefined();
    expect(Array.isArray(body.offerPictures)).toBe(true);
    expect(body.offerPictures.length).toBe(2);
    expect(body.offerPictures).toEqual(newCategory.offerPictures);

    // 验证自动生成的字段
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(body.isArchived).toBe(false);
  });

  it("should get all car categories", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Category");
  });

  it("should get a car category by id", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarCategory;
    expect(body.id).toBe(categoryId);
    expect(body.name).toBe("Test Category");
  });

  it("should delete a car category", async () => {
    const categoryToDelete = await prisma.carCategory.create({
      data: {
        name: "Category to Delete",
        image: "delete.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        tenant: {
          connect: { id: tenantId },
        },
        vehicleScenario: {
          connect: { id: vehicleScenarioId },
        },
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(204);

    const findResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(findResponse.status).toBe(404);
  });

  it("should update a car category's vehicle scenario", async () => {
    const newScenario = await prisma.vehicleScenario.create({
      data: {
        name: "New Test Scenario",
        description: "New Test Scenario Description",
        image: "https://example.com/new_scenario.jpg",
        tenantId: tenantId,
      },
    });

    const updatePayload = {
      vehicleScenarioId: newScenario.id,
    };

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

    expect(body.vehicleScenario).toBeDefined();
    if (body.vehicleScenario) {
      expect(body.vehicleScenario.id).toBe(newScenario.id);
      expect(body.vehicleScenario.name).toBe("New Test Scenario");
    }
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

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-categories isArchived logic", () => {
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
