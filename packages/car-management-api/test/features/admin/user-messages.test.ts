import app from "@/index";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/user-messages", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;
  let user: User;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
    tenantId = setup.tenantId;
    user = await prisma.user.create({
      data: {
        nickname: "test user",
        avatarUrl: "http://test.com/avatar.png",
        tenantId,
        phoneNumber: "13800138000",
        openId: "test-open-id",
      },
    });
  });

  const createUserMessage = (status: "PENDING" | "PROCESSED" = "PENDING") => {
    return prisma.userMessage.create({
      data: {
        name: "John Doe",
        phone: "1234567890",
        message: "This is a test message.",
        tenantId: tenantId,
        userId: user.id,
        status,
        processedAt: status === "PROCESSED" ? new Date() : undefined,
        processedById: status === "PROCESSED" ? adminUser.id : undefined,
      },
    });
  };

  it("should get all user messages", async () => {
    await createUserMessage();

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.total).toBe(1);
    expect(body.items[0].name).toBe("John Doe");
  });

  it("should filter user messages by status", async () => {
    await createUserMessage("PENDING");
    await createUserMessage("PROCESSED");

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages?status=PENDING`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.total).toBe(1);
    expect(body.items[0].status).toBe("PENDING");
  });

  it("should process a user message", async () => {
    const message = await createUserMessage("PENDING");

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages/${message.id}/process`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.status).toBe("PROCESSED");
    expect(body.processedById).toBe(adminUser.id);
    expect(body.processedAt).not.toBeNull();
  });

  it("should return 404 when processing a non-existent user message", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages/non-existent-id/process`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(404);
  });

  it("should return 400 when processing an already processed user message", async () => {
    const message = await createUserMessage("PROCESSED");
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages/${message.id}/process`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(400);
  });

  describe("as tenant_viewer", () => {
    it("should get all user messages", async () => {
      await createUserMessage();

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
      });
      expect(response.status).toBe(200);
      const body: any = await response.json();
      expect(body.total).toBe(1);
    });

    it("should return 403 when trying to process a user message", async () => {
      const message = await createUserMessage("PENDING");

      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/user-messages/${message.id}/process`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
      });
      expect(response.status).toBe(403);
    });
  });
});
