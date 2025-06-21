import app from "@/index";
import { prisma } from "@/lib/db";
import { wechatClient } from "@/lib/wechat";
import type { CarTrim, User } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

vi.mock("@/lib/wechat", () => ({
  wechatClient: {
    code2Session: vi.fn(),
  },
}));

describe("App API: /api/v1/app/tenants/:tenantId/favorites", () => {
  let tenant: TestTenant;
  let user: User;
  let token: string;
  let carTrim: CarTrim;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);

    vi.mocked(wechatClient.code2Session).mockResolvedValue({
      openid: "test_openid_for_fav",
      unionid: "test_unionid_for_fav",
      session_key: "test_session_key",
      errcode: 0,
      errmsg: "",
    });

    const loginRes = await app.request(`/api/v1/app/tenants/${tenant.id}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });
    const { user: u, token: t } = (await loginRes.json()) as { user: User; token: string };
    user = u;
    token = t;

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario",
        description: "Test Scenario Description",
        image: "https://example.com/scenario.jpg",
        tenantId: tenant.id,
      },
    });

    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category",
        tenantId: tenant.id,
        image: "https://example.com/image.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        vehicleScenarioId: scenario.id,
      },
    });

    carTrim = await prisma.carTrim.create({
      data: {
        name: "Test Trim",
        subtitle: "Subtitle for Trim",
        image: "https://example.com/trim.jpg",
        originalPrice: 200000,
        currentPrice: 180000,
        features: [],
        categoryId: category.id,
        tenantId: tenant.id,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add a car trim to favorites", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ carTrimId: carTrim.id }),
    });
    expect(response.status).toBe(201);
    const favorite = await prisma.userFavoriteCarTrim.findFirst({
      where: { userId: user.id, carTrimId: carTrim.id },
    });
    expect(favorite).not.toBeNull();
  });

  it("should list user's favorite car trims", async () => {
    await prisma.userFavoriteCarTrim.create({ data: { userId: user.id, carTrimId: carTrim.id } });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CarTrim[];
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(carTrim.id);
  });

  it("should remove a car trim from favorites", async () => {
    await prisma.userFavoriteCarTrim.create({ data: { userId: user.id, carTrimId: carTrim.id } });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/${carTrim.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const favorite = await prisma.userFavoriteCarTrim.findFirst({
      where: { userId: user.id, carTrimId: carTrim.id },
    });
    expect(favorite).toBeNull();
  });
  
  it("should check favorite status", async () => {
    // 1. Initially not favorited
    let statusRes = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/status/${carTrim.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(statusRes.status).toBe(200);
    expect(await statusRes.json()).toEqual({ isFavorite: false });

    // 2. Add to favorites
    await prisma.userFavoriteCarTrim.create({ data: { userId: user.id, carTrimId: carTrim.id } });
    statusRes = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/status/${carTrim.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(statusRes.status).toBe(200);
    expect(await statusRes.json()).toEqual({ isFavorite: true });

    // 3. Remove from favorites
    await prisma.userFavoriteCarTrim.deleteMany({ where: { userId: user.id, carTrimId: carTrim.id } });
    statusRes = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/status/${carTrim.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(statusRes.status).toBe(200);
    expect(await statusRes.json()).toEqual({ isFavorite: false });
  });
}); 