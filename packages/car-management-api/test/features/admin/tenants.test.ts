import type { CreateTenantInput, Tenant, UpdateTenantInput } from "@/api/admin/features/tenants/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    superAdminUser = setup.superAdminUser;
    adminUser = setup.adminUser;
    tenantId = setup.tenantId;
  });

  describe("as super_admin", () => {
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

    it("should update a tenant", async () => {
      const updatedTenantData: UpdateTenantInput = {
        name: "Updated Tenant Name",
      };
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdminUser.token}`,
        },
        body: JSON.stringify(updatedTenantData),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as Tenant;
      expect(body.name).toBe(updatedTenantData.name);
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

  describe("as admin", () => {
    it("should not create a new tenant", async () => {
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
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(newTenant),
      });
      expect(response.status).toBe(401);
    });

    it("should not get all tenants", async () => {
      const response = await app.request("/api/v1/admin/tenants", {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(401);
    });

    it("should not get a tenant by id", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(401);
    });

    it("should not update a tenant", async () => {
      const updatedTenantData: UpdateTenantInput = {
        name: "Updated Tenant Name",
      };
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(updatedTenantData),
      });
      expect(response.status).toBe(401);
    });

    it("should not delete a tenant", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      expect(response.status).toBe(401);
    });
  });
});
