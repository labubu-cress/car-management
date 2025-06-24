import app from "@/index";
import { prisma } from "@/lib/db";
import type { Tenant } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("GET /api/v1/app/resolve-tenant", () => {
  let tenant: Tenant;

  beforeAll(async () => {
    tenant = await prisma.tenant.create({
      data: {
        name: "Test Tenant for Resolve",
        appId: "test-app-id-for-resolve",
        appSecret: "test-app-secret-for-resolve",
      },
    });
  });

  afterAll(async () => {
    await prisma.tenant.delete({
      where: {
        id: tenant.id,
      },
    });
  });

  it("should resolve tenant id with correct appId", async () => {
    const res = await app.request(`/api/v1/app/resolve-tenant?appId=${tenant.appId}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tenantId: number };
    expect(body.tenantId).toBe(tenant.id);
  });

  it("should return 404 if tenant not found", async () => {
    const res = await app.request("/api/v1/app/resolve-tenant?appId=non-existent-app-id");
    expect(res.status).toBe(404);
  });

  it("should return 400 if appId is not provided", async () => {
    const res = await app.request("/api/v1/app/resolve-tenant");
    expect(res.status).toBe(400);
  });
});
