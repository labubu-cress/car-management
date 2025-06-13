import type { CreateAdminUserInput } from "@/api/admin/features/admin-users/schema";
import type { AdminUser } from "@/api/admin/features/admin-users/types";
import type {
  CreateCarCategoryInput,
  CreateCarTrimInput,
  CreateVehicleScenarioInput,
} from "@/api/admin/features/cars/schema";
import type { CreateTenantInput } from "@/api/admin/features/tenants/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import type { CarCategory, CarTrim, Tenant, User, VehicleScenario } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../helper";

describe("Admin API", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;
  let tenantAdminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, superAdminUser, adminUser, tenantAdminUser, tenantViewerUser } =
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
          Authorization: `Bearer ${adminUser.token}`,
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
        name: "new admin",
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
  describe("/api/v1/admin/car-categories", () => {
    it("should create a new car category", async () => {
      const newCategory: CreateCarCategoryInput = {
        name: "New Test Category",
        image: "https://example.com/new_image.jpg",
        tags: ["tag1", "tag2"],
        highlights: [{ title: "highlight1", value: "value1" }],
        interiorImages: ["https://example.com/interior1.jpg"],
        exteriorImages: ["https://example.com/exterior1.jpg"],
        offerPictures: ["https://example.com/offer1.jpg"],
      };
      const response = await app.request("/api/v1/admin/car-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantAdminUser.token}`,
        },
        body: JSON.stringify(newCategory),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({ name: newCategory.name });
    });

    it("should get all car categories", async () => {
      const response = await app.request("/api/v1/admin/car-categories", {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
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
  describe("/api/v1/admin/car-categories/:categoryId/trims", () => {
    it("should create a new car trim for a category", async () => {
      const newTrim: CreateCarTrimInput = {
        name: "Test Trim",
        subtitle: "A nice trim",
        image: "https://example.com/trim.jpg",
        originalPrice: "50000",
        currentPrice: "48000",
        features: [{ title: "Feature 1", value: "Value 1" }],
        categoryId: categoryId,
      };
      const response = await app.request(`/api/v1/admin/car-categories/${categoryId}/trims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantAdminUser.token}`,
        },
        body: JSON.stringify(newTrim),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({ name: newTrim.name });
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
      const response = await app.request(`/api/v1/admin/car-categories/${categoryId}/trims`, {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as CarTrim[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // VehicleScenario Management Tests
  describe("/api/v1/admin/vehicle-scenarios", () => {
    it("should create a new vehicle scenario", async () => {
      const newScenario: CreateVehicleScenarioInput = {
        name: "Test Drive",
        image: "https://example.com/test_drive.jpg",
        description: "A test drive scenario",
      };
      const response = await app.request("/api/v1/admin/vehicle-scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantAdminUser.token}`,
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
      const response = await app.request("/api/v1/admin/vehicle-scenarios", {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
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
  describe("/api/v1/admin/users", () => {
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

      const response = await app.request("/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${tenantAdminUser.token}`,
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
