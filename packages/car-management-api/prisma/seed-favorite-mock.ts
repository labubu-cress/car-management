/**
 * @deprecated do not use this file!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  console.log(`开始执行收藏夹模拟数据填充脚本...`);

  const tenant = await prisma.tenant.upsert({
    where: { appId: 'default-appid' },
    update: {},
    create: {
      name: '默认租户',
      appId: 'default-appid',
      appSecret: 'default-appsecret',
      status: 'active',
      config: {},
    },
  });
  console.log(`默认租户 "${tenant.name}" 已创建。`);

  const user = await prisma.user.upsert({
    where: { tenantId_openId: { tenantId: tenant.id, openId: 'test-user-open-id' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nickname: '测试用户',
      avatarUrl: 'https://via.placeholder.com/150',
      phoneNumber: '1234567890',
      openId: 'test-user-open-id',
    },
  });
  console.log(`用户 "${user.nickname}" 已创建.`);

  const scenario = await prisma.vehicleScenario.upsert({
    where: { id: 'clw9g9z1d000008l5g5z6g3z1' },
    update: {},
    create: {
      id: 'clw9g9z1d000008l5g5z6g3z1',
      tenantId: tenant.id,
      name: '日常通勤',
      description: '适合城市日常代步',
      image: 'https://via.placeholder.com/300',
    },
  });
  console.log(`场景 "${scenario.name}" 已创建.`);

  const category = await prisma.carCategory.upsert({
    where: { id: 'clw9g9z1d000108l5g5z6g3z2' },
    update: {},
    create: {
      id: 'clw9g9z1d000108l5g5z6g3z2',
      tenantId: tenant.id,
      name: 'Model S',
      image: 'https://via.placeholder.com/300',
      badge: 'New',
      tags: '["Sedan", "Luxury"]',
      highlights: '[]',
      interiorImages: '[]',
      exteriorImages: '[]',
      offerPictures: '[]',
      vehicleScenarioId: scenario.id,
    },
  });
  console.log(`分类 "${category.name}" 已创建.`);

  const trim1 = await prisma.carTrim.upsert({
    where: { id: 'clw9g9z1d000208l5g5z6g3z3' },
    update: {},
    create: {
      id: 'clw9g9z1d000208l5g5z6g3z3',
      tenantId: tenant.id,
      name: '长续航版',
      subtitle: '更远的续航里程',
      image: 'https://via.placeholder.com/300',
      originalPrice: 750000,
      currentPrice: 700000,
      features: '[]',
      categoryId: category.id,
    },
  });
  console.log(`车辆版本 "${trim1.name}" 已创建.`);

  const trim2 = await prisma.carTrim.upsert({
    where: { id: 'clw9g9z1d000308l5g5z6g3z4' },
    update: {},
    create: {
      id: 'clw9g9z1d000308l5g5z6g3z4',
      tenantId: tenant.id,
      name: 'Plaid 版',
      subtitle: '极致性能',
      image: 'https://via.placeholder.com/300',
      originalPrice: 900000,
      currentPrice: 850000,
      features: '[]',
      categoryId: category.id,
    },
  });
  console.log(`车辆版本 "${trim2.name}" 已创建.`);

  await seedUserFavoriteCarTrims(prisma);
}

export async function seedUserFavoriteCarTrims(prisma: PrismaClient) {
  console.log('Seeding user favorite car trims...');

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found, skipping favorite car trim seeding.');
    return;
  }

  const carTrims = await prisma.carTrim.findMany();
  if (carTrims.length === 0) {
    console.log('No car trims found, skipping favorite car trim seeding.');
    return;
  }

  const favoritesToCreate: { userId: string; carTrimId: string }[] = [];

  // User 1 likes the first 2 car trims
  if (users[0] && carTrims[0]) {
    favoritesToCreate.push({
      userId: users[0].id,
      carTrimId: carTrims[0].id,
    });
  }
  if (users[0] && carTrims[1]) {
    favoritesToCreate.push({
      userId: users[0].id,
      carTrimId: carTrims[1].id,
    });
  }

  // User 2 likes the last car trim
  if (users[1] && carTrims.length > 1) {
    const lastCarTrim = carTrims[carTrims.length - 1];
    favoritesToCreate.push({
      userId: users[1].id,
      carTrimId: lastCarTrim.id,
    });
  }

  for (const favorite of favoritesToCreate) {
    await prisma.userFavoriteCarTrim.upsert({
      where: {
        userId_carTrimId: {
          userId: favorite.userId,
          carTrimId: favorite.carTrimId,
        },
      },
      update: {},
      create: favorite,
    });
  }

  console.log('Finished seeding user favorite car trims.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('收藏夹模拟数据填充脚本执行完毕。');
  })
  .catch(async (e) => {
    console.error('收藏夹模拟数据填充脚本执行失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
