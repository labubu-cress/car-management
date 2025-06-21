import app from "@/index";
import { prisma } from "@/lib/db";
import { wechatClient } from "@/lib/wechat";
import type { User } from "@prisma/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
    clearTestDb,
    createTestTenant,
    createTestUser,
    getTestAppUserToken,
    type TestTenant,
    type TestUser,
} from "../../helper";

vi.mock("@/lib/wechat", () => {
  return {
    wechatClient: {
      getPhoneNumber: vi.fn(),
    },
  };
});

describe("App API: /api/v1/app/users", () => {
  let tenant: TestTenant;
  let user: TestUser;
  let token = "";

  beforeAll(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    user = await createTestUser(prisma, tenant.id);
    token = await getTestAppUserToken(user);
  });

  afterEach(async () => {
    vi.clearAllMocks();
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
      vi.mocked(wechatClient.getPhoneNumber).mockResolvedValue({
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

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(dbUser?.phoneNumber).toBe(mockPhoneNumber);
    });

    it("should return 400 if wechat code is invalid", async () => {
      vi.mocked(wechatClient.getPhoneNumber).mockResolvedValue(undefined);
      const response = await app.request(`/api/v1/app/tenants/${tenant.id}/users/current/phone-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: "invalid_code" }),
      });

      expect(response.status).toBe(400);
    });
  });
}); 