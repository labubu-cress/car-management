import app from "@/index";
import { prisma } from "@/lib/db";
import type { CarTrim } from "@prisma/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
    clearTestDb,
    createTestTenant,
    createTestUser,
    getTestAppUserToken,
    type TestTenant,
    type TestUser,
} from "../../helper";

describe("App API: /api/v1/app/favorites", () => {
  let tenant: TestTenant;
  let user: TestUser;
  let token = "";
  let carTrim: CarTrim;

  beforeAll(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);
    user = await createTestUser(prisma, tenant.id);
    token = await getTestAppUserToken(user);

    const scenario = await prisma.vehicleScenario.create({
      data: {
        name: "Test Scenario for Favorites",
        description: "Test Scenario Description for Favorites",
        image: "https://example.com/scenario-favorites.jpg",
        tenantId: tenant.id,
      },
    });

    const category = await prisma.carCategory.create({
      data: {
        name: "Test Category for Favorites",
        tenantId: tenant.id,
        image: "https://example.com/image-favorites.jpg",
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
        name: "Test Trim for Favorites",
        subtitle: "Subtitle for Favorites Trim",
        image: "https://example.com/trim-favorites.jpg",
        originalPrice: 120000,
        currentPrice: 110000,
        features: [],
        categoryId: category.id,
        tenantId: tenant.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.userFavoriteCarTrim.deleteMany();
  });

  it("should add a car trim to favorites, check status, get list, remove it, and check status again", async () => {
    // 1. Add to favorites
    const addResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ carTrimId: carTrim.id }),
    });
    expect(addResponse.status).toBe(201);
    const dbFavorite = await prisma.userFavoriteCarTrim.findFirst({
      where: {
        userId: user.id,
        carTrimId: carTrim.id,
      },
    });
    expect(dbFavorite).not.toBeNull();

    // 2. Check favorite status - should be true
    const statusResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/status/${carTrim.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(statusResponse.status).toBe(200);
    expect(await statusResponse.json()).toEqual({ isFavorite: true });

    // 3. Get favorites list
    const listResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listResponse.status).toBe(200);
    const favorites = (await listResponse.json()) as any[];
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe(carTrim.id);
    expect(favorites[0].name).toBe(carTrim.name);

    // 4. Remove from favorites
    const removeResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites/${carTrim.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(removeResponse.status).toBe(200);
    const dbFavoriteAfterRemove = await prisma.userFavoriteCarTrim.findFirst({
      where: {
        userId: user.id,
        carTrimId: carTrim.id,
      },
    });
    expect(dbFavoriteAfterRemove).toBeNull();

    // 5. Check favorite status again - should be false
    const statusAfterRemoveResponse = await app.request(
      `/api/v1/app/tenants/${tenant.id}/favorites/status/${carTrim.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(statusAfterRemoveResponse.status).toBe(200);
    expect(await statusAfterRemoveResponse.json()).toEqual({ isFavorite: false });

    // 6. Get favorites list again
    const listAfterRemoveResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(listAfterRemoveResponse.status).toBe(200);
    const favoritesAfterRemove = await listAfterRemoveResponse.json();
    expect(favoritesAfterRemove).toHaveLength(0);
  });

  it("should return favorite trims including archived ones", async () => {
    // Add trim to favorites
    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: carTrim.id,
      },
    });

    // Archive the car trim
    await prisma.carTrim.update({
      where: { id: carTrim.id },
      data: { isArchived: true },
    });

    // Get favorites list
    const listResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(listResponse.status).toBe(200);
    const favorites = (await listResponse.json()) as any[];
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe(carTrim.id);
    expect(favorites[0].name).toBe(carTrim.name);
    expect(favorites[0].isArchived).toBe(true);

    // Un-archive the car trim to not affect other tests
    await prisma.carTrim.update({
      where: { id: carTrim.id },
      data: { isArchived: false },
    });
  });

  it("should include vehicleScenario in the favorite list", async () => {
    // Add trim to favorites
    await prisma.userFavoriteCarTrim.create({
      data: {
        userId: user.id,
        carTrimId: carTrim.id,
      },
    });

    const listResponse = await app.request(`/api/v1/app/tenants/${tenant.id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(listResponse.status).toBe(200);
    const favorites = (await listResponse.json()) as any[];

    expect(favorites).toHaveLength(1);
    expect(favorites[0].category).toHaveProperty("vehicleScenario");

    const scenarioInBeforeAll = await prisma.vehicleScenario.findFirst({
      where: { name: "Test Scenario for Favorites" },
    });
    expect(favorites[0].category.vehicleScenario.id).toBe(scenarioInBeforeAll?.id);
    expect(favorites[0].category.vehicleScenario.name).toBe(scenarioInBeforeAll?.name);
  });
});
