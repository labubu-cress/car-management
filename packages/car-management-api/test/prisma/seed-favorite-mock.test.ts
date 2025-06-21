import { prisma } from '@/lib/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { main as seedFavorites } from '../../prisma/seed-favorite-mock';
import { clearTestDb } from '../helper';

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Prisma seed-favorite-mock', () => {
  beforeEach(async () => {
    await clearTestDb(prisma);
  });

  it('should seed the database with mock data and favorites', async () => {
    await seedFavorites();

    const tenant = await prisma.tenant.findUnique({
      where: { appId: 'default-appid' },
    });
    expect(tenant).not.toBeNull();
    expect(tenant?.name).toBe('默认租户');

    const user = await prisma.user.findFirst({
      where: { tenantId: tenant?.id },
    });
    expect(user).not.toBeNull();
    expect(user?.nickname).toBe('测试用户');

    const scenario = await prisma.vehicleScenario.findFirst({
      where: { tenantId: tenant?.id },
    });
    expect(scenario).not.toBeNull();
    expect(scenario?.name).toBe('日常通勤');

    const category = await prisma.carCategory.findFirst({
      where: { tenantId: tenant?.id },
    });
    expect(category).not.toBeNull();
    expect(category?.name).toBe('Model S');

    const trims = await prisma.carTrim.findMany({
      where: { tenantId: tenant?.id },
      orderBy: { name: 'asc' },
    });
    expect(trims.length).toBe(2);
    expect(trims[0].name).toBe('Plaid 版');
    expect(trims[1].name).toBe('长续航版');

    const userFavoriteCarTrims = await prisma.userFavoriteCarTrim.findMany({
        where: { userId: user?.id },
    });
    expect(userFavoriteCarTrims.length).toBe(2);
  });
}); 