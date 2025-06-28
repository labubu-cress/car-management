import app from "@/index";
import { prisma } from "@/lib/db";
import { WeChatClient } from "@/lib/wechat";
import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTestDb,
  createTestTenant,
  createTestUser,
  getTestAppUserToken,
  type TestTenant,
  type TestUser,
} from "../../helper";

vi.mock("@/lib/wechat");

describe("App API: /api/v1/app/users", () => {
  let tenant: TestTenant;
  let user: TestUser;
  let token = "";
  const mockGetPhoneNumber = vi.fn();

  beforeEach(async () => {
    vi.resetAllMocks();

    vi.mocked(WeChatClient).mockImplementation(() => {
      return {
        getPhoneNumber: mockGetPhoneNumber,
      } as any;
    });

    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    user = await createTestUser(prisma, tenant.id);
    token = await getTestAppUserToken(user);
  });

  describe("/current", () => {
    it("should get current user", async () => {
      const response = await app.request(`/api/v1/app/tenants/${tenant.id}/users/current`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      const currentUser = (await response.json()) as User;
      expect(currentUser).toBeDefined();
      expect(currentUser.id).toBe(user.id);
      expect(currentUser.openId).toBe(user.openId);
    });
  });

  describe("/current/phone-number", () => {
    it("should update user phone number", async () => {
      const mockPhoneNumber = "13800138000";
      mockGetPhoneNumber.mockResolvedValue({
        phoneNumber: mockPhoneNumber,
        purePhoneNumber: "13800138000",
        countryCode: "86",
        watermark: {
          timestamp: Date.now(),
          appid: "test_appid",
        },
      });
      const response = await app.request(`/api/v1/app/tenants/${tenant.id}/users/current/phone-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: "test_code" }),
      });

      expect(response.status).toBe(200);
      const updatedUser = (await response.json()) as User;
      expect(updatedUser.phoneNumber).toBe(mockPhoneNumber);
      expect(WeChatClient).toHaveBeenCalledWith(tenant.appId, tenant.appSecret);
      expect(mockGetPhoneNumber).toHaveBeenCalledWith("test_code");

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(dbUser?.phoneNumber).toBe(mockPhoneNumber);
    });

    it("should return 400 if wechat code is invalid", async () => {
      mockGetPhoneNumber.mockResolvedValue(undefined);
      const response = await app.request(`/api/v1/app/tenants/${tenant.id}/users/current/phone-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: "invalid_code" }),
      });

      expect(response.status).toBe(400);
      expect(WeChatClient).toHaveBeenCalledWith(tenant.appId, tenant.appSecret);
    });

    it("should return 400 if tenant wechat config is missing", async () => {
      const tenantWithoutConfig = await prisma.tenant.create({
        data: { name: "No Config Tenant", appId: "", appSecret: "" },
      });
      const userInNewTenant = await createTestUser(prisma, tenantWithoutConfig.id);
      const tokenForNewTenant = await getTestAppUserToken(userInNewTenant);

      const response = await app.request(`/api/v1/app/tenants/${tenantWithoutConfig.id}/users/current/phone-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenForNewTenant}`,
        },
        body: JSON.stringify({ code: "any_code" }),
      });

      expect(response.status).toBe(400);
      const body = (await response.json()) as { message: string };
      expect(body.message).toBe("Tenant WeChat configuration is missing or invalid.");
      expect(WeChatClient).not.toHaveBeenCalled();
    });
  });
});
