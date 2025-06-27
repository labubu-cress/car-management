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
    expect(body.isServiceTime).toBe(true);
  });

  it("should return isServiceTime correctly based on workdays and hours", async () => {
    const contactUsConfigData = {
      tenantId: tenant.id,
      contactPhoneDescription: "Call us",
      contactPhoneNumber: "123456789",
      workdays: [1, 2, 3, 4, 5], // Mon-Fri
      workStartTime: 9, // 9:00
      workEndTime: 18, // 18:00
    };
    await prisma.contactUsConfig.create({
      data: contactUsConfigData,
    });

    // Mock time to be within service hours
    // Use a Wednesday 10:00 AM for testing
    vi.useFakeTimers();
    const serviceTime = new Date("2024-07-24T10:00:00+08:00"); // A Wednesday
    vi.setSystemTime(serviceTime);

    let response = await app.request(`/api/v1/app/tenants/${tenant.id}/contact-us-config`);
    expect(response.status).toBe(200);
    let body = (await response.json()) as any;
    expect(body.isServiceTime).toBe(true);

    // Mock time to be outside service hours (weekend)
    const nonServiceTimeWeekend = new Date("2024-07-28T10:00:00+08:00"); // A Sunday
    vi.setSystemTime(nonServiceTimeWeekend);

    response = await app.request(`/api/v1/app/tenants/${tenant.id}/contact-us-config`);
    expect(response.status).toBe(200);
    body = (await response.json()) as any;
    expect(body.isServiceTime).toBe(false);

    // Mock time to be outside service hours (weekday, but wrong hour)
    const nonServiceTimeHour = new Date("2024-07-24T08:00:00+08:00"); // Same Wednesday, but at 8 AM
    vi.setSystemTime(nonServiceTimeHour);

    response = await app.request(`/api/v1/app/tenants/${tenant.id}/contact-us-config`);
    expect(response.status).toBe(200);
    body = (await response.json()) as any;
    expect(body.isServiceTime).toBe(false);
  });
});
