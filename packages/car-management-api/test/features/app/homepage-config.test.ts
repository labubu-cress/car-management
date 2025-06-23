import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/homepage-config", () => {
  let tenant: TestTenant;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
  });

  it("should get null if homepage config does not exist for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/homepage-config`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  it("should get homepage config if it exists for the tenant", async () => {
    // Create homepage config via Prisma directly (bypassing admin API for app tests)
    const homepageConfigData = {
      tenantId: tenant.id,
      firstTitle: "App First Title",
      firstTitleIcon: "app-first-icon.png",
      secondTitle: "App Second Title",
      secondTitleIcon: "app-second-icon.png",
      bannerImage: "app-banner.jpg",
      benefitsImage: "app-benefits.jpg",
    };
    await prisma.homepageConfig.create({
      data: homepageConfigData,
    });

    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/homepage-config`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject(homepageConfigData);
  });
});
