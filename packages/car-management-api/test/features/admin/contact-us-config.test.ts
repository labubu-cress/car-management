import app from "@/index";
import { prisma } from "@/lib/db";
import type { ContactUsConfig } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/contact-us-config", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantId = setup.tenantId;
  });

  it("should get null if contact us config does not exist", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/contact-us-config`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  it("should create and update contact us config", async () => {
    // Create
    const createData = {
      contactPhoneDescription: "Call us for a free consultation",
      contactPhoneNumber: "123-456-7890",
      contactEmailDescription: "Email us for any inquiries",
      contactEmail: "contact@example.com",
      workdays: [1, 2, 3, 4, 5],
      workStartTime: 9,
      workEndTime: 18,
    };
    const createResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/contact-us-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(createData),
    });
    expect(createResponse.status).toBe(200);
    const createdBody = (await createResponse.json()) as ContactUsConfig;
    expect(createdBody).toMatchObject(createData);
    expect(createdBody.tenantId).toBe(tenantId);

    // Verify it was created by getting it
    const getResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/contact-us-config`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(getResponse.status).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody).toMatchObject(createData);

    // Update
    const updateData = {
      contactPhoneNumber: "098-765-4321",
      contactEmail: "support@example.com",
      workdays: [0, 1, 2, 3, 4, 5, 6],
      workStartTime: 8,
      workEndTime: 20,
    };
    const updateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/contact-us-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(updateData),
    });
    expect(updateResponse.status).toBe(200);
    const updatedBody = (await updateResponse.json()) as ContactUsConfig;
    expect(updatedBody).toMatchObject({
      ...createData,
      ...updateData,
    });

    // Verify it was updated
    const getAfterUpdateResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/contact-us-config`, {
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
