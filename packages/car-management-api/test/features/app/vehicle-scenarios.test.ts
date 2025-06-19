import app from "@/index";
import { prisma } from "@/lib/db";
import type { VehicleScenario } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/vehicle-scenarios", () => {
  let tenant: TestTenant;
  let scenarioId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario App",
        description: "Test Scenario Description App",
        image: "https://example.com/scenario-app.jpg",
        tenantId: tenant.id,
      },
    });
    scenarioId = scenario.id;
  });

  it("should get all vehicle scenarios for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/vehicle-scenarios`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as VehicleScenario[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Test Scenario App");
    expect(body[0].tenantId).toBe(tenant.id);
  });

  it("should get a vehicle scenario by id for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/vehicle-scenarios/${scenarioId}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as VehicleScenario;
    expect(body.id).toBe(scenarioId);
    expect(body.name).toBe("Test Scenario App");
    expect(body.tenantId).toBe(tenant.id);
  });
});
