import type { CarTrim, CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/car-trims CREATE", () => {
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
}); 