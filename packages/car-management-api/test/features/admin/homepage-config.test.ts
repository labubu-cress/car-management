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

  const baseHomepageConfigData = {
    firstTitle: "First Title",
    firstTitleIcon: "first-icon.png",
    secondTitle: "Second Title",
    secondTitleIcon: "second-icon.png",
    benefitsImage: "benefits.jpg",
  };

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

  it("should create and update homepage config with bannerImage", async () => {
    // Create
    const createData = {
      ...baseHomepageConfigData,
      bannerImage: "banner.jpg",
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
    expect(createdBody.bannerVideo).toBeNull();

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
      ...baseHomepageConfigData,
      firstTitle: "Updated First Title",
      bannerImage: "new-banner.jpg",
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
    expect(updatedBody.bannerVideo).toBeNull();

    // Verify it was updated
    const getAfterUpdateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    const getAfterUpdateBody = await getAfterUpdateResponse.json();
    expect(getAfterUpdateBody).toMatchObject(updateData);
  });

  it("should create and update homepage config with bannerVideo", async () => {
    // Create with bannerVideo
    const createData = {
      ...baseHomepageConfigData,
      bannerVideo: "video.mp4",
      bannerTitle: "Video Title",
      bannerDescription: "Video Description",
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
    expect(createdBody.bannerImage).toBeNull();

    // Update to bannerImage
    const updateData = {
      ...baseHomepageConfigData,
      bannerImage: "new-banner.jpg",
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
    expect(updatedBody.bannerImage).toBe(updateData.bannerImage);
    expect(updatedBody.bannerVideo).toBeNull();
    expect(updatedBody.bannerTitle).toBeNull();
    expect(updatedBody.bannerDescription).toBeNull();
  });

  it("should return 400 if both bannerImage and bannerVideo are provided", async () => {
    const data = {
      ...baseHomepageConfigData,
      bannerImage: "banner.jpg",
      bannerVideo: "video.mp4",
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(data),
    });
    expect(response.status).toBe(400);
  });

  it("should return 400 if neither bannerImage nor bannerVideo is provided", async () => {
    const data = {
      ...baseHomepageConfigData,
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/homepage-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(data),
    });
    expect(response.status).toBe(400);
  });

  describe("as tenant_viewer", () => {
    it("should get homepage config if it exists", async () => {
      // First create a config as admin
      const createData = {
        ...baseHomepageConfigData,
        bannerImage: "banner.jpg",
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
        ...baseHomepageConfigData,
        bannerImage: "new-banner.jpg",
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
