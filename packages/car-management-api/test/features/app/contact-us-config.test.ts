import app from "@/index";
import { prisma } from "@/lib/db";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/contact-us-config", () => {
  let tenant: TestTenant;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should get null if contact us config does not exist for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/contact-us-config`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  it("should get contact us config if it exists for the tenant", async () => {
    const contactUsConfigData = {
      tenantId: tenant.id,
      contactPhoneDescription: "Call us",
      contactPhoneNumber: "123456789",
      contactEmailDescription: "Email us",
      contactEmail: "test@example.com",
    };
    await prisma.contactUsConfig.create({
      data: contactUsConfigData,
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/contact-us-config`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as any;
    expect(body).toMatchObject(contactUsConfigData);
  });
});
