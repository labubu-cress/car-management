import type { CarTrim, CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
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
      originalPrice: 580000,
      currentPrice: 548000,
      features: [
        { title: "座椅配置", value: "真皮座椅，前排座椅加热/通风" },
        { title: "科技配置", value: "12.3英寸中控屏，无线充电" },
        { title: "安全配置", value: "主动刹车，车道偏离预警" },
        { title: "动力系统", value: "2.0T发动机+8AT变速箱" },
        { title: "悬挂系统", value: "前麦弗逊后多连杆独立悬挂" },
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
    expect(body.features[0]).toMatchObject({ title: "座椅配置", value: "真皮座椅，前排座椅加热/通风" });
    expect(body.features[1]).toMatchObject({ title: "科技配置", value: "12.3英寸中控屏，无线充电" });
    expect(body.features[2]).toMatchObject({ title: "安全配置", value: "主动刹车，车道偏离预警" });
    expect(body.features[3]).toMatchObject({ title: "动力系统", value: "2.0T发动机+8AT变速箱" });
    expect(body.features[4]).toMatchObject({ title: "悬挂系统", value: "前麦弗逊后多连杆独立悬挂" });

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
    expect(typeof body.originalPrice).toBe("string");
    expect(typeof body.currentPrice).toBe("string");
    expect(Array.isArray(body.features)).toBe(true);
    expect(typeof body.categoryId).toBe("string");
    expect(typeof body.tenantId).toBe("string");
  });

  it("should get all car trims for a category, sorted by displayOrder", async () => {
    await prisma.carTrim.create({
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
    expect(body[1].name).toBe("Trim 2");
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

  it("should get a car trim by id", async () => {
    const trim = await prisma.carTrim.create({
      data: {
        name: "Test Trim for Get",
        subtitle: "A nice trim",
        image: "https://example.com/trim.jpg",
        originalPrice: 50000,
        currentPrice: 48000,
        features: [],
        categoryId: categoryId,
        tenantId: tenantId,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims/${trim.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim;
    expect(body.id).toBe(trim.id);
    expect(body.name).toBe("Test Trim for Get");
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
});
