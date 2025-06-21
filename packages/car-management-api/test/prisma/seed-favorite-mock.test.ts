import type { CarCategory } from '@/api/admin/features/car-categories/types';
import type { CarTrim } from '@/api/admin/features/car-trims/types';
import type { UserWithFavorites } from '@/api/admin/features/users/types';
import app from '@/index';
import { prisma } from '@/lib/db';
import type { Tenant, VehicleScenario } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { main as seedFavorites } from '../../prisma/seed-favorite-mock';
import {
  clearTestDb,
  createAdminUserForTenant,
  type TestAdminUserWithToken,
} from '../helper-favorite';

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Prisma seed-favorite-mock', () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  beforeEach(async () => {
    await clearTestDb(prisma);
  });

  it('should seed the database with mock data and favorites, verified via API', async () => {
    await seedFavorites();

    const seededTenant = await prisma.tenant.findUnique({
      where: { appId: 'default-appid' },
    });
    expect(seededTenant).not.toBeNull();
    tenantId = seededTenant!.id;

    // Create an admin user for the tenant created by the seed script
    adminUser = await createAdminUserForTenant(prisma, tenantId);

    // --- Verification using Admin API ---

    // Verify Tenant
    const tenantResponse = await app.request(`/api/v1/admin/tenants/${tenantId}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(tenantResponse.status).toBe(200);
    const tenant: Tenant = (await tenantResponse.json()) as Tenant;
    expect(tenant).not.toBeNull();
    expect(tenant.name).toBe('默认租户');

    // Verify User, Scenario, Category, Trims by fetching them all
    const usersResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/users`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(usersResponse.status).toBe(200);
    const users: UserWithFavorites[] = (await usersResponse.json()) as UserWithFavorites[];
    expect(users.length).toBe(1);
    const user = users[0];
    expect(user.nickname).toBe('测试用户');

    const scenariosResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/vehicle-scenarios`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(scenariosResponse.status).toBe(200);
    const scenarios: VehicleScenario[] = (await scenariosResponse.json()) as VehicleScenario[];
    expect(scenarios.length).toBe(1);
    expect(scenarios[0].name).toBe('日常通勤');
    
    const categoriesResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-categories`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(categoriesResponse.status).toBe(200);
    const categories: CarCategory[] = (await categoriesResponse.json()) as CarCategory[];
    expect(categories.length).toBe(1);
    expect(categories[0].name).toBe('Model S');

    const trimsResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/car-trims`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
        
    });
    expect(trimsResponse.status).toBe(200);
    const trims: CarTrim[] = (await trimsResponse.json()) as CarTrim[];
    trims.sort((a,b) => a.name.localeCompare(b.name));
    expect(trims.length).toBe(2);
    expect(trims[0].name).toBe('Plaid 版');
    expect(trims[1].name).toBe('长续航版');

    // Verify user's favorite car trims by fetching the user by ID
    const userDetailResponse = await app.request(`/api/v1/admin/tenants/${tenantId}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${adminUser.token}` },
    });
    expect(userDetailResponse.status).toBe(200);
    const userDetail: UserWithFavorites = (await userDetailResponse.json()) as UserWithFavorites;
    expect(userDetail.favoriteCarTrims.length).toBe(2);
  });
}); 