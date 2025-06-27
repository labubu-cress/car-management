import app from "@/index";
import { prisma } from "@/lib/db";
import type { HomepageConfig } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/homepage-config", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
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
      firstTitle: "First Title",
      firstTitleIcon: "first-icon.png",
      secondTitle: "Second Title",
      secondTitleIcon: "second-icon.png",
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
      firstTitle: "Updated First Title",
      firstTitleIcon: "updated-first-icon.png",
      secondTitle: "Updated Second Title",
      secondTitleIcon: "updated-second-icon.png",
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
    expect(updatedBody).toMatchObject(updateData);

    // Verify it was updated
    const getAfterUpdateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    const getAfterUpdateBody = await getAfterUpdateResponse.json();
    expect(getAfterUpdateBody).toMatchObject(updateData);
  });

  describe("as tenant_viewer", () => {
    it("should get homepage config if it exists", async () => {
      // First create a config as admin
      const createData = {
        firstTitle: "First Title",
        firstTitleIcon: "first-icon.png",
        secondTitle: "Second Title",
        secondTitleIcon: "second-icon.png",
        bannerImage: "banner.jpg",
        benefitsImage: "benefits.jpg",
      };
      await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify(createData),
      });

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject(createData);
    });

    it("should return 403 when trying to update homepage config", async () => {
      const updateData = {
        firstTitle: "Updated First Title",
        firstTitleIcon: "updated-first-icon.png",
        secondTitle: "Updated Second Title",
        secondTitleIcon: "updated-second-icon.png",
        bannerImage: "new-banner.jpg",
        benefitsImage: "new-benefits.jpg",
      };
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
        body: JSON.stringify(updateData),
      });
      expect(response.status).toBe(403);
    });
  });
});
