import app from "@/index";
import { prisma } from "@/lib/db";
import { wechatClient } from "@/lib/wechat";
import type { User } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

vi.mock("@/lib/wechat", () => {
  return {
    wechatClient: {
      code2Session: vi.fn(),
    },
  };
});

describe("App API: /api/v1/app/auth", () => {
  let tenant: TestTenant;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    vi.mocked(wechatClient.code2Session).mockResolvedValue({
      openid: "test_openid",
      unionid: "test_unionid",
      session_key: "test_session_key",
      errcode: 0,
      errmsg: "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register a new user and return token", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });

    expect(response.status).toBe(200);
    const { token, user } = (await response.json()) as { token: string; user: User };
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
    expect(token).toBeDefined();
    expect(user).toBeDefined();
    expect(user.id).toBe(existingUser.id);
    expect(user.openId).toBe("test_openid");
    expect(user.nickname).toBe("Existing User");

    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });
});
