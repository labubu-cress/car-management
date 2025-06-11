import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/db/client";
import { app } from "../../src/index";
import {
  clearTestDb,
  createTestTenantAndAdminUsers,
  TestAdminUserWithToken,
} from "../helper";

describe("Admin API", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));
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
        .set("Authorization", `Bearer ${adminUser.token}`)
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
  describe.only("/api/v1/admin/admin-users", () => {
    it.only("should create a new admin user", async () => {
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
        tenantId: tenantId,
      };
      const response = await request(app)
        .post(`/api/v1/admin/car-categories/${categoryId}/trims`)
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send(newTrim);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: newTrim.name });
    });

    it("should get all car trims for a category", async () => {
      const response = await request(app)
        .get(`/api/v1/admin/car-categories/${categoryId}/trims`)
        .set("Authorization", `Bearer ${adminUser.token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
