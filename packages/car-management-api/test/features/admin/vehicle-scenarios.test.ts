import type { CreateVehicleScenarioInput } from "@/api/admin/features/vehicle-scenarios/schema";
import app from "@/index";
import { prisma } from "@/lib/db";
import type { VehicleScenario } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/vehicle-scenarios", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantViewerUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    const setup = await createTestTenantAndAdminUsers(prisma);
    adminUser = setup.adminUser;
    tenantViewerUser = setup.tenantViewerUser;
    tenantId = setup.tenantId;
  });

  it("should create a new vehicle scenario", async () => {
    const newScenario: CreateVehicleScenarioInput = {
      name: "Test Drive",
      image: "https://example.com/test_drive.jpg",
      description: "A test drive scenario",
    };
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminUser.token}`,
      },
      body: JSON.stringify(newScenario),
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ name: newScenario.name });
  });

  it("should get all vehicle scenarios", async () => {
    await prisma.vehicleScenario.create({
      data: {
        name: "Existing Scenario",
        description: "Existing Scenario Description",
        image: "https://example.com/existing_scenario.jpg",
        tenantId: tenantId,
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
      method: "GET",
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as any[];
    expect(Array.isArray(body)).toBe(true);
    // There is 1 scenario now from this test
    expect(body.length).toBe(1);
    expect(body.some((s) => s.name === "Existing Scenario")).toBe(true);
  });

  it("should get a vehicle scenario by id", async () => {
    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Existing Scenario",
        image: "existing.jpg",
        description: "An existing scenario",
        tenantId: tenantId,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenario.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as VehicleScenario;
    expect(body.id).toBe(scenario.id);
    expect(body.name).toBe("Existing Scenario");
  });

  it("should delete a vehicle scenario", async () => {
    const scenarioToDelete = await prisma.vehicleScenario.create({
      data: {
        name: "Scenario to Delete",
        image: "delete.jpg",
        description: "A scenario to be deleted",
        tenantId: tenantId,
      },
    });
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenarioToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(204);

    const findResponse = await app.request(
      `/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenarioToDelete.id}`,
      {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      },
    );
    expect(findResponse.status).toBe(404);
  });

  describe("as tenant_viewer", () => {
    let scenario: VehicleScenario;

    beforeEach(async () => {
      scenario = await prisma.vehicleScenario.create({
        data: {
          name: "Existing Scenario",
          image: "existing.jpg",
          description: "An existing scenario",
          tenantId: tenantId,
        },
      });
    });

    it("should get all vehicle scenarios", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        headers: { Authorization: `Bearer ${tenantViewerUser.token}` },
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as any[];
      expect(body.length).toBe(1);
    });

    it("should get a vehicle scenario by id", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenario.id}`, {
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(200);
    });

    it("should not create a new vehicle scenario", async () => {
      const newScenario: CreateVehicleScenarioInput = {
        name: "Test Drive",
        image: "https://example.com/test_drive.jpg",
        description: "A test drive scenario",
      };
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
        body: JSON.stringify(newScenario),
      });
      expect(response.status).toBe(403);
    });

    it("should not update a vehicle scenario", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
        body: JSON.stringify({ name: "updated" }),
      });
      expect(response.status).toBe(403);
    });

    it("should not delete a vehicle scenario", async () => {
      const response = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios/${scenario.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tenantViewerUser.token}`,
        },
      });
      expect(response.status).toBe(403);
    });
  });
});
