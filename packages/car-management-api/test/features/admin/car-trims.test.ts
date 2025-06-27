import type { CarTrim, CarTrimWithFavorites, CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims", () => {
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

  it("should create a new car trim for a category", async () => {
    const newTrim: CreateCarTrimInput = {
      name: "豪华版",
      subtitle: "旗舰豪华配置，尊享驾乘体验",
      image: "https://example.com/trim-luxury.jpg",
      configImageUrl: "https://example.com/trim-luxury-config.jpg",
      originalPrice: 580000,
      currentPrice: 548000,
      features: [
        { title: "座椅配置", icon: "https://example.com/icon1.jpg" },
        { title: "科技配置", icon: "https://example.com/icon2.jpg" },
        { title: "安全配置", icon: "https://example.com/icon3.jpg" },
        { title: "动力系统", icon: "https://example.com/icon4.jpg" },
        { title: "悬挂系统", icon: "https://example.com/icon5.jpg" },
      ],
      categoryId: categoryId,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(newTrim),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as CarTrim;

    // 验证基本信息
    expect(body).toMatchObject({
      name: newTrim.name,
      subtitle: newTrim.subtitle,
      image: newTrim.image,
      configImageUrl: newTrim.configImageUrl,
      originalPrice: String(newTrim.originalPrice),
      currentPrice: String(newTrim.currentPrice),
      categoryId: categoryId,
      tenantId: tenantId,
    });

    // 验证价格字段
    expect(body.originalPrice).toBe("580000");
    expect(body.currentPrice).toBe("548000");
    expect(Number(body.originalPrice)).toBeGreaterThan(Number(body.currentPrice));

    // 验证 features 数组
    expect(body.features).toBeDefined();
    expect(Array.isArray(body.features)).toBe(true);
    expect(body.features.length).toBe(5);
    expect(body.features[0]).toMatchObject({ title: "座椅配置", icon: "https://example.com/icon1.jpg" });
    expect(body.features[1]).toMatchObject({ title: "科技配置", icon: "https://example.com/icon2.jpg" });
    expect(body.features[2]).toMatchObject({ title: "安全配置", icon: "https://example.com/icon3.jpg" });
    expect(body.features[3]).toMatchObject({ title: "动力系统", icon: "https://example.com/icon4.jpg" });
    expect(body.features[4]).toMatchObject({ title: "悬挂系统", icon: "https://example.com/icon5.jpg" });

    // 验证关联关系
    expect(body.categoryId).toBe(categoryId);
    expect(body.tenantId).toBe(tenantId);

    // 验证自动生成的字段
    expect(body.id).toBeDefined();
    expect(body.displayOrder).toBe(0);
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();

    // 验证字段类型
    expect(typeof body.name).toBe("string");
    expect(typeof body.subtitle).toBe("string");
    expect(typeof body.image).toBe("string");
    expect(typeof body.configImageUrl).toBe("string");
    expect(typeof body.originalPrice).toBe("string");
    expect(typeof body.currentPrice).toBe("string");
    expect(Array.isArray(body.features)).toBe(true);
    expect(typeof body.categoryId).toBe("string");
    expect(typeof body.tenantId).toBe("string");
  });

  it("should create a new car trim without configImageUrl", async () => {
    const newTrim: CreateCarTrimInput = {
      name: "标准版",
      subtitle: "基础配置，经济实用",
      image: "https://example.com/trim-standard.jpg",
      originalPrice: 480000,
      currentPrice: 450000,
      features: [],
      categoryId: categoryId,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(newTrim),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as CarTrim;
    expect(body).toMatchObject({
      name: newTrim.name,
      subtitle: newTrim.subtitle,
      image: newTrim.image,
      originalPrice: String(newTrim.originalPrice),
      currentPrice: String(newTrim.currentPrice),
      categoryId: categoryId,
      tenantId: tenantId,
    });
    expect(body.configImageUrl).toBeNull();
  });

  it("should get all car trims for a category, sorted by displayOrder", async () => {
    await prisma.carTrim.create({
      data: {
        name: "Trim 2",
        subtitle: "A nice trim",
        image: "https://example.com/trim.jpg",
        configImageUrl: "https://example.com/trim2-config.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
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
        image: "https://example.com/trim.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
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
        image: "https://example.com/trim.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
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
        image: "https://example.com/trim.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
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

  it("should get a car trim by id with users who favorited it", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Get",
        subtitle: "A nice trim",
        image: "https://example.com/trim.jpg",
        configImageUrl: "https://example.com/trim-get-config.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });

    const user = await prisma.user.create({
      data: {
        openId: "test-user-openid-for-favorite",
        nickname: "Favorite User",
        avatarUrl: "avatar.jpg",
        phoneNumber: "12345678903",
        tenantId: tenantId,
      },
    });

    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: trim.id,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrimWithFavorites;
    expect(body.id).toBe(trim.id);
    expect(body.name).toBe("Test Trim for Get");
    expect(body.configImageUrl).toBe("https://example.com/trim-get-config.jpg");
    expect(body.favoritedBy).toBeDefined();
    expect(Array.isArray(body.favoritedBy)).toBe(true);
    expect(body.favoritedBy.length).toBe(1);
    expect(body.favoritedBy[0].user.id).toBe(user.id);
    expect(body.favoritedBy[0].user.nickname).toBe("Favorite User");
    expect(body.favoritedBy[0].user.openId).toBe("test-user-openid-for-favorite");
  });

  it("should delete a car trim", async () => {
    const trimToDelete = await prisma.carTrim.create({
      data: {
        name: "Trim to Delete",
        subtitle: "A trim to be deleted",
        image: "https://example.com/trim-delete.jpg",
        originalPrice: 600000,
        currentPrice: 560000,
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(204);

    const findResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trimToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(findResponse.status).toBe(404);
  });

  it("should update a car trim, including archiving and unarchiving", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Update",
        subtitle: "Initial subtitle",
        image: "https://example.com/trim_initial.jpg",
        originalPrice: 60000,
        currentPrice: 55000,
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });

    // Update name and configImageUrl
    const updateData = { name: "Updated Trim Name", configImageUrl: "https://example.com/updated-config.jpg" };
    let response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updateData),
    });
    expect(response.status).toBe(200);
    let body = (await response.json()) as CarTrim;
    expect(body.name).toBe(updateData.name);
    expect(body.configImageUrl).toBe(updateData.configImageUrl);
    let updatedTrimInDb = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrimInDb?.configImageUrl).toBe(updateData.configImageUrl);

    // Archive the car trim
    const archiveUpdateData = { isArchived: true };
    response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(archiveUpdateData),
    });
    expect(response.status).toBe(200);
    body = (await response.json()) as CarTrim;
    expect(body.isArchived).toBe(true);

    // Verify it's archived in the DB
    let updatedTrim = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrim?.isArchived).toBe(true);

    // Unarchive the car trim
    const unarchiveUpdateData = { isArchived: false };
    response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(unarchiveUpdateData),
    });
    expect(response.status).toBe(200);
    body = (await response.json()) as CarTrim;
    expect(body.isArchived).toBe(false);

    // Verify it's unarchived in the DB
    updatedTrim = await prisma.carTrim.findUnique({ where: { id: trim.id } });
    expect(updatedTrim?.isArchived).toBe(false);
  });

  it("should return isArchived status when getting a single trim", async () => {
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
        isArchived: true,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    const body = (await response.json()) as CarTrimWithFavorites;
    expect(body.isArchived).toBe(true);
  });
});

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims for TENANT_VIEWER", () => {
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
