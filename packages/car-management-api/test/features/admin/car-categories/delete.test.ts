import app from "@/index";
import { prisma } from "@/lib/db";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../../helper";

describe("Admin API: car-categories delete", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;
  let vehicleScenarioId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario",
        description: "Test Scenario Description",
        image: "https://example.com/scenario.jpg",
        tenantId: tenantId,
      },
    });
    vehicleScenarioId = scenario.id;
  });

  it("should delete a car category", async () => {
    const categoryToDelete = await prisma.carCategory.create({
      data: {
        name: "Category to Delete",
        image: "delete.jpg",
        tags: [],
        highlights: [],
        interiorImages: [],
        exteriorImages: [],
        offerPictures: [],
        tenant: {
          connect: { id: tenantId },
        },
        vehicleScenario: {
          connect: { id: vehicleScenarioId },
        },
      },
    });

    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(response.status).toBe(204);

    const findResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories/${categoryToDelete.id}`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    expect(findResponse.status).toBe(404);
  });
}); 