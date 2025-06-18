import app from "@/index";
import { prisma } from "@/lib/db";
import type { HomepageConfig } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/homepage-config", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantId = setup.tenantId;
  });

  it("should get null if homepage config does not exist", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  it("should create and update homepage config", async () => {
    // Create
    const createData = {
      welcomeTitle: "Welcome!",
      welcomeDescription: "To our amazing car dealership.",
      bannerImage: "banner.jpg",
      benefitsImage: "benefits.jpg",
    };
    const createResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(createData),
    });
    expect(createResponse.status).toBe(200);
    const createdBody = (await createResponse.json()) as HomepageConfig;
    expect(createdBody).toMatchObject(createData);
    expect(createdBody.tenantId).toBe(tenantId);

    // Verify it was created by getting it
    const getResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(getResponse.status).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody).toMatchObject(createData);

    // Update
    const updateData = {
      welcomeTitle: "Welcome Back!",
      bannerImage: "new-banner.jpg",
      benefitsImage: "new-benefits.jpg",
    };
    const updateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updateData),
    });
    expect(updateResponse.status).toBe(200);
    const updatedBody = (await updateResponse.json()) as HomepageConfig;
    expect(updatedBody).toMatchObject({
      ...createData,
      ...updateData,
    });

    // Verify it was updated
    const getAfterUpdateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    const getAfterUpdateBody = await getAfterUpdateResponse.json();
    expect(getAfterUpdateBody).toMatchObject({
      ...createData,
      ...updateData,
    });
  });
});
