import type { CreateAdminUserInput } from "@/api/admin/features/admin-users/schema";
import type { AdminUser } from "@/api/admin/features/admin-users/types";
import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/admin-users", () => {
  let superAdminUser: TestAdminUserWithToken;
  let adminUser: TestAdminUserWithToken;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ superAdminUser, adminUser } = await createTestTenantAndAdminUsers(prisma));
  });

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
