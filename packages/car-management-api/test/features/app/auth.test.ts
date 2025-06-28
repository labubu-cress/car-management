import app from "@/index";
import { prisma } from "@/lib/db";
import { WeChatClient } from "@/lib/wechat";
import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

vi.mock("@/lib/wechat");

describe("App API: /api/v1/app/auth", () => {
  let tenant: TestTenant;
  const mockCode2Session = vi.fn();

  beforeEach(async () => {
    vi.resetAllMocks();

    vi.mocked(WeChatClient).mockImplementation(() => {
      return {
        code2Session: mockCode2Session,
      } as any;
    });

    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    mockCode2Session.mockResolvedValue({
      openid: "test_openid",
      unionid: "test_unionid",
      session_key: "test_session_key",
    });
  });

  it("should register a new user and return token", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });

    expect(response.status).toBe(200);
    const { token, user } = (await response.json()) as { token: string; user: User };

    expect(WeChatClient).toHaveBeenCalledWith(tenant.appId, tenant.appSecret);
    expect(mockCode2Session).toHaveBeenCalledWith("test_code");

    expect(token).toBeDefined();
    expect(user).toBeDefined();
    expect(user.openId).toBe("test_openid");
    expect(user.unionId).toBe("test_unionid");
    expect(user.tenantId).toBe(tenant.id);
    expect(user.nickname).toBe("用户openid");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.openId).toBe("test_openid");
  });

  it("should login an existing user and return token", async () => {
    const existingUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        openId: "test_openid",
        unionId: "test_unionid",
        nickname: "Existing User",
        avatarUrl: "",
        phoneNumber: "",
      },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "any_code" }),
    });

    expect(response.status).toBe(200);
    const { token, user } = (await response.json()) as { token: string; user: User };

    expect(WeChatClient).toHaveBeenCalledWith(tenant.appId, tenant.appSecret);
    expect(mockCode2Session).toHaveBeenCalledWith("any_code");

    expect(token).toBeDefined();
    expect(user).toBeDefined();
    expect(user.id).toBe(existingUser.id);
    expect(user.openId).toBe("test_openid");
    expect(user.nickname).toBe("Existing User");

    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });

  it("should return 400 if tenant wechat config is missing", async () => {
    // Create a tenant without appId/appSecret
    const tenantWithoutConfig = await prisma.tenant.create({
      data: { name: "No Config Tenant", appId: "", appSecret: "" },
    });

    const response = await app.request(`/api/v1/app/tenants/${tenantWithoutConfig.id}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "any_code" }),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { message: string };
    expect(body.message).toBe("Tenant WeChat configuration is missing or invalid.");
  });
});
