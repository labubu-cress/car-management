import type { CreateAdminUserInput } from "@/api/admin/features/admin-users/schema";
import type { AdminUser } from "@/api/admin/features/admin-users/types";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/admin-users", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    superAdminUser = setup.superAdminUser;
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
    tenantId = setup.tenantId;
  });

  it("admin should not create a new super_admin user", async () => {
    const newAdmin: CreateAdminUserInput = {
      username: "new-super-admin",
      password: "password123",
      role: "super_admin",
    };
    const response = await app.request("/api/v1/admin/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(newAdmin),
    });
    expect(response.status).toBe(403);
  });

  it("admin should create a new tenant_viewer user in the same tenant", async () => {
    const newAdmin: CreateAdminUserInput = {
      username: "new-viewer",
      password: "password123",
      role: "tenant_viewer",
      tenantId,
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
      tenantId,
    });
  });

  it("should get all admin users for the tenant", async () => {
    const response = await app.request("/api/v1/admin/admin-users", {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as AdminUser[];
    expect(Array.isArray(body)).toBe(true);
    // admin and tenant_viewer
    expect(body.length).toBe(2);
  });

  it("super_admin should get all admin users", async () => {
    const response = await app.request("/api/v1/admin/admin-users", {
      headers: {
        Authorization: `Bearer ${superAdminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as AdminUser[];
    expect(Array.isArray(body)).toBe(true);
    // super_admin, admin, and tenant_viewer
    expect(body.length).toBe(3);
  });

  it("should get an admin user by id", async () => {
    const response = await app.request(`/api/v1/admin/admin-users/${adminUser.id}`, {
      headers: {
        Authorization: `Bearer ${superAdminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as AdminUser;
    expect(body.id).toBe(adminUser.id);
  });

  describe("tenant_viewer permissions", () => {
    it("should not create a new admin user", async () => {
      const newAdmin: CreateAdminUserInput = {
        username: "newadmin",
        password: "password123",
        role: "admin",
        tenantId,
      };
      const response = await app.request("/api/v1/admin/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
        body: JSON.stringify(newAdmin),
      });
      expect(response.status).toBe(403);
    });

    it("should not update an admin user", async () => {
      const response = await app.request(`/api/v1/admin/admin-users/${adminUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
        body: JSON.stringify({ role: "admin" }),
      });
      expect(response.status).toBe(403);
    });

    it("should not delete an admin user", async () => {
      const response = await app.request(`/api/v1/admin/admin-users/${adminUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(403);
    });

    it("should get users in the same tenant", async () => {
      const response = await app.request("/api/v1/admin/admin-users", {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as AdminUser[];
      expect(body.length).toBe(2); // admin and tenant_viewer
    });

    it("should get a user by id in the same tenant", async () => {
      const response = await app.request(`/api/v1/admin/admin-users/${adminUser.id}`, {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as AdminUser;
      expect(body.id).toBe(adminUser.id);
    });
  });
});
