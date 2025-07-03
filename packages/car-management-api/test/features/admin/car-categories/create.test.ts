import type { CarCategory, CreateCarCategoryInput } from "@/api/admin/features/car-categories/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories create", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let vehicleScenarioId: string;

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
  });

  it("should create a new car category", async () => {
    const newCategory: CreateCarCategoryInput = {
      name: "New Test Category",
      image: "https://example.com/new_image.jpg",
      minPrice: 100000,
      maxPrice: 200000,
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
      minPrice: 100000,
      maxPrice: 200000,
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
}); 