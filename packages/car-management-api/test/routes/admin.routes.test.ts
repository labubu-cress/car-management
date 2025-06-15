import type { CreateAdminUserInput } from "@/api/admin/features/admin-users/schema";
import type { AdminUser } from "@/api/admin/features/admin-users/types";
import type { CreateCarCategoryInput } from "@/api/admin/features/car-categories/schema";
import type { CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
import type { CreateTenantInput } from "@/api/admin/features/tenants/schema";
import type { CreateVehicleScenarioInput } from "@/api/admin/features/vehicle-scenarios/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import type { CarCategory, CarTrim, Tenant, User, VehicleScenario } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../helper";

describe("Admin API", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, superAdminUser, adminUser } =
      await createTestTenantAndAdminUsers(prisma));
    // Create a car category for car trim tests
    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category",
        tenantId: tenantId,
        image: "image.jpg",
        tags: "[]",
        highlights: "[]",
        interiorImages: "[]",
        exteriorImages: "[]",
        offerPictures: "[]",
      },
    });
    categoryId = category.id;
  });

  // Tenant Management Tests
  describe("/api/v1/admin/tenants", () => {
    it("should create a new tenant", async () => {
      const newTenant: CreateTenantInput = {
        name: "New Test Tenant",
        appId: "new-test-app-id",
        appSecret: "a-new-secure-secret",
      };
      const response = await app.request("/api/v1/admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdminUser.token}`,
        },
        body: JSON.stringify(newTenant),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({
        name: newTenant.name,
        appId: newTenant.appId,
      });
    });

    it("should get all tenants", async () => {
      const response = await app.request("/api/v1/admin/tenants", {
        headers: {
          Authorization: `Bearer ${superAdminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as Tenant[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // AdminUser Management Tests
  describe("/api/v1/admin/admin-users", () => {
    it("should create a new admin user", async () => {
      const newAdmin: CreateAdminUserInput = {
        username: "newadmin",
        password: "password123",
        role: "admin",
      };
      const response = await app.request("/api/v1/admin/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(newAdmin),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({
        username: newAdmin.username,
        role: newAdmin.role,
      });
    });

    it("should get all admin users", async () => {
      const response = await app.request("/api/v1/admin/admin-users", {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as AdminUser[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // CarCategory Management Tests
  describe("/api/v1/admin/tenants/:tenantId/car-categories", () => {
    it("should create a new car category", async () => {
      const newCategory: CreateCarCategoryInput = {
        name: "New Test Category",
        image: "https://example.com/new_image.jpg",
        tags: ["豪华", "舒适", "智能驾驶"],
        highlights: [
          { title: "动力系统", value: "2.0T涡轮增压" },
          { title: "燃油经济性", value: "7.5L/100km" },
          { title: "最大功率", value: "245马力" }
        ],
        interiorImages: [
          "https://example.com/interior1.jpg",
          "https://example.com/interior2.jpg",
          "https://example.com/interior3.jpg"
        ],
        exteriorImages: [
          "https://example.com/exterior1.jpg",
          "https://example.com/exterior2.jpg"
        ],
        offerPictures: [
          "https://example.com/offer1.jpg",
          "https://example.com/offer2.jpg"
        ],
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
        tenantId: tenantId
      });
      
      // 验证 tags 数组
      expect(body.tags).toBeDefined();
      const parsedTags = JSON.parse(body.tags as string);
      expect(Array.isArray(parsedTags)).toBe(true);
      expect(parsedTags).toEqual(newCategory.tags);
      expect(parsedTags.length).toBe(3);
      expect(parsedTags).toContain("豪华");
      expect(parsedTags).toContain("舒适");
      expect(parsedTags).toContain("智能驾驶");
      
      // 验证 highlights 数组
      expect(body.highlights).toBeDefined();
      const parsedHighlights = JSON.parse(body.highlights as string);
      expect(Array.isArray(parsedHighlights)).toBe(true);
      expect(parsedHighlights.length).toBe(3);
      expect(parsedHighlights[0]).toMatchObject({ title: "动力系统", value: "2.0T涡轮增压" });
      expect(parsedHighlights[1]).toMatchObject({ title: "燃油经济性", value: "7.5L/100km" });
      expect(parsedHighlights[2]).toMatchObject({ title: "最大功率", value: "245马力" });
      
      // 验证 interiorImages 数组
      expect(body.interiorImages).toBeDefined();
      const parsedInteriorImages = JSON.parse(body.interiorImages as string);
      expect(Array.isArray(parsedInteriorImages)).toBe(true);
      expect(parsedInteriorImages.length).toBe(3);
      expect(parsedInteriorImages).toEqual(newCategory.interiorImages);
      
      // 验证 exteriorImages 数组
      expect(body.exteriorImages).toBeDefined();
      const parsedExteriorImages = JSON.parse(body.exteriorImages as string);
      expect(Array.isArray(parsedExteriorImages)).toBe(true);
      expect(parsedExteriorImages.length).toBe(2);
      expect(parsedExteriorImages).toEqual(newCategory.exteriorImages);
      
      // 验证 offerPictures 数组
      expect(body.offerPictures).toBeDefined();
      const parsedOfferPictures = JSON.parse(body.offerPictures as string);
      expect(Array.isArray(parsedOfferPictures)).toBe(true);
      expect(parsedOfferPictures.length).toBe(2);
      expect(parsedOfferPictures).toEqual(newCategory.offerPictures);
      
      // 验证自动生成的字段
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
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
  });

  // CarTrim Management Tests
  describe("/api/v1/admin/tenants/:tenantId/car-trims", () => {
    it("should create a new car trim for a category", async () => {
      const newTrim: CreateCarTrimInput = {
        name: "豪华版",
        subtitle: "旗舰豪华配置，尊享驾乘体验",
        image: "https://example.com/trim-luxury.jpg",
        originalPrice: "580000",
        currentPrice: "548000",
        features: [
          { title: "座椅配置", value: "真皮座椅，前排座椅加热/通风" },
          { title: "科技配置", value: "12.3英寸中控屏，无线充电" },
          { title: "安全配置", value: "主动刹车，车道偏离预警" },
          { title: "动力系统", value: "2.0T发动机+8AT变速箱" },
          { title: "悬挂系统", value: "前麦弗逊后多连杆独立悬挂" }
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
        originalPrice: newTrim.originalPrice,
        currentPrice: newTrim.currentPrice,
        categoryId: categoryId,
        tenantId: tenantId
      });
      
      // 验证价格字段
      expect(body.originalPrice).toBe("580000");
      expect(body.currentPrice).toBe("548000");
      expect(Number(body.originalPrice)).toBeGreaterThan(Number(body.currentPrice));
      
      // 验证 features 数组
      expect(body.features).toBeDefined();
      const parsedFeatures = JSON.parse(body.features as string);
      expect(Array.isArray(parsedFeatures)).toBe(true);
      expect(parsedFeatures.length).toBe(5);
      expect(parsedFeatures[0]).toMatchObject({ title: "座椅配置", value: "真皮座椅，前排座椅加热/通风" });
      expect(parsedFeatures[1]).toMatchObject({ title: "科技配置", value: "12.3英寸中控屏，无线充电" });
      expect(parsedFeatures[2]).toMatchObject({ title: "安全配置", value: "主动刹车，车道偏离预警" });
      expect(parsedFeatures[3]).toMatchObject({ title: "动力系统", value: "2.0T发动机+8AT变速箱" });
      expect(parsedFeatures[4]).toMatchObject({ title: "悬挂系统", value: "前麦弗逊后多连杆独立悬挂" });
      
      // 验证关联关系
      expect(body.categoryId).toBe(categoryId);
      expect(body.tenantId).toBe(tenantId);
      
      // 验证自动生成的字段
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
      
      // 验证字段类型
      expect(typeof body.name).toBe("string");
      expect(typeof body.subtitle).toBe("string");
      expect(typeof body.image).toBe("string");
      expect(typeof body.originalPrice).toBe("string");
      expect(typeof body.currentPrice).toBe("string");
      expect(typeof body.features).toBe("string");
      expect(typeof body.categoryId).toBe("string");
      expect(typeof body.tenantId).toBe("string");
    });

    it("should get all car trims for a category", async () => {
      await prisma.carTrim.create({
        data: {
          name: "Test Trim for Get",
          subtitle: "A nice trim",
          image: "trim.jpg",
          originalPrice: "50000",
          currentPrice: "48000",
          features: "[]",
          categoryId: categoryId,
          tenantId: tenantId,
        },
      });
      const response = await app.request(
        `/api/v1/admin/tenants/${tenantId}/car-trims?categoryId=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        },
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as CarTrim[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // VehicleScenario Management Tests
  describe("/api/v1/admin/tenants/:tenantId/vehicle-scenarios", () => {
    it("should create a new vehicle scenario", async () => {
      const newScenario: CreateVehicleScenarioInput = {
        name: "Test Drive",
        image: "https://example.com/test_drive.jpg",
        description: "A test drive scenario",
      };
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(newScenario),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({ name: newScenario.name });
    });

    it("should get all vehicle scenarios", async () => {
      await prisma.vehicleScenario.create({
        data: {
          name: "Existing Scenario",
          image: "existing.jpg",
          description: "An existing scenario",
          tenantId: tenantId,
        },
      });
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as VehicleScenario[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0].name).toBe("Existing Scenario");
    });
  });

  // User Management Tests
  describe("/api/v1/admin/tenants/:tenantId/users", () => {
    it("should get all users for the tenant", async () => {
      // Create a user for the tenant
      await prisma.user.create({
        data: {
          openId: "test-user-openid-for-getall",
          nickname: "Test User",
          avatarUrl: "avatar.jpg",
          phoneNumber: "12345678901",
          tenantId: tenantId,
        },
      });

      // Create a user for another tenant to ensure filtering
      const otherTenant = await prisma.tenant.create({
        data: {
          name: "Other Tenant",
          appId: "other-app-id",
          appSecret: "other-app-secret",
        },
      });
      await prisma.user.create({
        data: {
          openId: "other-tenant-user-openid",
          nickname: "Other Tenant User",
          avatarUrl: "avatar.jpg",
          phoneNumber: "1112223333",
          tenantId: otherTenant.id,
        },
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as User[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1); // Should only get user for its own tenant
      expect(body[0].nickname).toBe("Test User");
    });
  });
});
