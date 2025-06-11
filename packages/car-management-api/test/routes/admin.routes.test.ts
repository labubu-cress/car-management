import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/db/client";
import { app } from "../../src/index";
import { clearTestDb, createTestTenantAndAdminUsers, TestAdminUserWithToken } from "../helper";

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
      const newTenant = {
        name: "New Test Tenant",
        appId: "new-test-app-id",
        appSecret: "a-new-secure-secret",
      };
      const response = await request(app)
        .post("/api/v1/admin/tenants")
        .set("Authorization", `Bearer ${superAdminUser.token}`)
        .send(newTenant);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: newTenant.name,
        appId: newTenant.appId,
      });
    });

    it("should get all tenants", async () => {
      const response = await request(app)
        .get("/api/v1/admin/tenants")
        .set("Authorization", `Bearer ${adminUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // AdminUser Management Tests
  describe("/api/v1/admin/admin-users", () => {
    it("should create a new admin user", async () => {
      const newAdmin = {
        username: "newadmin",
        password: "password123",
        role: "admin",
      };
      const response = await request(app)
        .post("/api/v1/admin/admin-users")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send(newAdmin);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        username: newAdmin.username,
        role: newAdmin.role,
      });
    });

    it("should get all admin users", async () => {
      const response = await request(app)
        .get("/api/v1/admin/admin-users")
        .set("Authorization", `Bearer ${adminUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // CarCategory Management Tests
  describe("/api/v1/admin/car-categories", () => {
    it("should create a new car category", async () => {
      const newCategory = {
        name: "New Test Category",
        image: "new_image.jpg",
        tags: '["tag1", "tag2"]',
        highlights: '["highlight1"]',
        interiorImages: '["interior1.jpg"]',
        exteriorImages: '["exterior1.jpg"]',
        offerPictures: '["offer1.jpg"]',
      };
      const response = await request(app)
        .post("/api/v1/admin/car-categories")
        .set("Authorization", `Bearer ${tenantAdminUser.token}`)
        .send(newCategory);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: newCategory.name });
    });

    it("should get all car categories", async () => {
      const response = await request(app)
        .get("/api/v1/admin/car-categories")
        .set("Authorization", `Bearer ${tenantViewerUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Test Category");
    });
  });

  // CarTrim Management Tests
  describe("/api/v1/admin/car-categories/:categoryId/trims", () => {
    it("should create a new car trim for a category", async () => {
      const newTrim = {
        name: "Test Trim",
        subtitle: "A nice trim",
        image: "trim.jpg",
        originalPrice: "50000",
        currentPrice: "48000",
        features: "[]",
      };
      const response = await request(app)
        .post(`/api/v1/admin/car-categories/${categoryId}/trims`)
        .set("Authorization", `Bearer ${tenantAdminUser.token}`)
        .send(newTrim);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: newTrim.name });
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
      const response = await request(app)
        .get(`/api/v1/admin/car-categories/${categoryId}/trims`)
        .set("Authorization", `Bearer ${tenantViewerUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // VehicleScenario Management Tests
  describe("/api/v1/admin/vehicle-scenarios", () => {
    it("should create a new vehicle scenario", async () => {
      const newScenario = {
        name: "Test Drive",
        image: "test_drive.jpg",
        description: "A test drive scenario",
      };
      const response = await request(app)
        .post("/api/v1/admin/vehicle-scenarios")
        .set("Authorization", `Bearer ${tenantAdminUser.token}`)
        .send(newScenario);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: newScenario.name });
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
      const response = await request(app)
        .get("/api/v1/admin/vehicle-scenarios")
        .set("Authorization", `Bearer ${tenantViewerUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe("Existing Scenario");
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

      const response = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tenantAdminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Should only get user for its own tenant
      expect(response.body[0].nickname).toBe("Test User");
    });
  });
});
