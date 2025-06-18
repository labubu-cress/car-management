import type { CreateAdminUserInput } from "@/api/admin/features/admin-users/schema";
import type { AdminUser } from "@/api/admin/features/admin-users/types";
import type { CarCategory, CreateCarCategoryInput } from "@/api/admin/features/car-categories/schema";
import type { CarTrim, CreateCarTrimInput } from "@/api/admin/features/car-trims/schema";
import type { CreateTenantInput, Tenant } from "@/api/admin/features/tenants/schema";
import type { CreateVehicleScenarioInput } from "@/api/admin/features/vehicle-scenarios/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import * as ossSts from "@/lib/oss-sts";
import type { User, VehicleScenario } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../helper";

describe("Admin API", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;
  let vehicleScenarioId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, superAdminUser, adminUser } = await createTestTenantAndAdminUsers(prisma));

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario",
        description: "Test Scenario Description",
        image: "https://example.com/scenario.jpg",
        tenantId: tenantId,
      },
    });
    vehicleScenarioId = scenario.id;

    // Create a car category for car trim tests
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

  // Tenant Management Tests
  describe("/api/v1/admin/tenants", () => {
    it("should create a new tenant", async () => {
      const newTenant: CreateTenantInput = {
        name: "New Test Tenant",
        appId: "new-test-app-id",
        appSecret: "a-new-secure-secret",
        config: {},
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

    it("should get a tenant by id", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${superAdminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as Tenant;
      expect(body.id).toBe(tenantId);
    });

    it("should delete a tenant", async () => {
      const tenantToDelete = await prisma.tenant.create({
        data: {
          name: "Tenant to Delete",
          appId: "to-delete-app-id",
          appSecret: "a-secure-secret-to-delete",
        },
      });
      const response = await app.request(`/api/v1/admin/tenants/${tenantToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${superAdminUser.token}`,
        },
      });
      expect(response.status).toBe(204);

      const findResponse = await app.request(`/api/v1/admin/tenants/${tenantToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${superAdminUser.token}`,
        },
      });
      expect(findResponse.status).toBe(404);
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

    it("should get an admin user by id", async () => {
      const response = await app.request(`/api/v1/admin/admin-users/${adminUser.id}`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as AdminUser;
      expect(body.id).toBe(adminUser.id);
    });

    it("should delete an admin user", async () => {
      const newAdmin: CreateAdminUserInput = {
        username: "deletable-admin",
        password: "password123",
        role: "admin",
      };
      const createResponse = await app.request("/api/v1/admin/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdminUser.token}`,
        },
        body: JSON.stringify(newAdmin),
      });
      expect(createResponse.status).toBe(201);
      const adminToDelete = (await createResponse.json()) as AdminUser;

      const response = await app.request(`/api/v1/admin/admin-users/${adminToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${superAdminUser.token}`,
        },
      });
      expect(response.status).toBe(204);

      const findResponse = await app.request(`/api/v1/admin/admin-users/${adminToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(findResponse.status).toBe(404);
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
          { title: "最大功率", value: "245马力" },
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
      expect(body.highlights[0]).toMatchObject({ title: "动力系统", value: "2.0T涡轮增压" });
      expect(body.highlights[1]).toMatchObject({ title: "燃油经济性", value: "7.5L/100km" });
      expect(body.highlights[2]).toMatchObject({ title: "最大功率", value: "245马力" });

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

      const findResponse = await app.request(
        `/api/v1/admin/tenants/${tenantId}/car-categories/${categoryToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        },
      );
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
        originalPrice: newTrim.originalPrice,
        currentPrice: newTrim.currentPrice,
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

    it("should get all car trims for a category", async () => {
      await prisma.carTrim.create({
        data: {
          name: "Test Trim for Get",
          subtitle: "A nice trim",
          image: "https://example.com/trim.jpg",
          originalPrice: "50000",
          currentPrice: "48000",
          features: [],
          categoryId: categoryId,
          tenantId: tenantId,
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
      expect(body.length).toBeGreaterThan(0);
    });

    it("should get a car trim by id", async () => {
      const trim = await prisma.carTrim.create({
        data: {
          name: "Test Trim for Get",
          subtitle: "A nice trim",
          image: "https://example.com/trim.jpg",
          originalPrice: "50000",
          currentPrice: "48000",
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
          originalPrice: "600000",
          currentPrice: "560000",
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

  // Img Management Tests
  describe("/api/v1/admin/tenants/:tenantId/img", () => {
    const mockToken = {
      secretId: "mock-secret-id",
      secretKey: "mock-secret-key",
      sessionToken: "mock-session-token",
      region: "mock-region",
      bucket: "mock-bucket",
      expiredTime: 1678886400,
      startTime: 1678882800,
    };

    beforeEach(() => {
      vi.spyOn(ossSts, "createQcloudImgUploadToken").mockResolvedValue(mockToken);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should get an upload token", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/img/upload-token`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockToken);
      expect(ossSts.createQcloudImgUploadToken).toHaveBeenCalledWith(tenantId);
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
          description: "Existing Scenario Description",
          image: "https://example.com/existing_scenario.jpg",
          tenantId: tenantId,
        },
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        method: "GET",
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as any[];
      expect(Array.isArray(body)).toBe(true);
      // There are 2 scenarios now, one from beforeEach, one from this test
      expect(body.length).toBe(2);
      // Check that both scenarios are present, regardless of order
      expect(body.some((s) => s.name === "Existing Scenario")).toBe(true);
      expect(body.some((s) => s.name === "Test Scenario")).toBe(true);
    });

    it("should get a vehicle scenario by id", async () => {
      const scenario = await prisma.vehicleScenario.create({
        data: {
          name: "Existing Scenario",
          image: "existing.jpg",
          description: "An existing scenario",
          tenantId: tenantId,
        },
      });
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenario.id}`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as VehicleScenario;
      expect(body.id).toBe(scenario.id);
      expect(body.name).toBe("Existing Scenario");
    });

    it("should delete a vehicle scenario", async () => {
      const scenarioToDelete = await prisma.vehicleScenario.create({
        data: {
          name: "Scenario to Delete",
          image: "delete.jpg",
          description: "A scenario to be deleted",
          tenantId: tenantId,
        },
      });
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenarioToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(204);

      const findResponse = await app.request(
        `/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenarioToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${adminUser.token}`,
          },
        },
      );
      expect(findResponse.status).toBe(404);
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

    it("should get a user by id", async () => {
      const user = await prisma.user.create({
        data: {
          openId: "test-user-openid-for-get-by-id",
          nickname: "Test User for Get By Id",
          avatarUrl: "avatar.jpg",
          phoneNumber: "12345678902",
          tenantId: tenantId,
        },
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as User;
      expect(Array.isArray(body)).toBe(false);
      expect(body.id).toBe(user.id);
      expect(body.nickname).toBe("Test User for Get By Id");
    });
  });
});
