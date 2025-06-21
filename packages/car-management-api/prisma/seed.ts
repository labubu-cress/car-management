import { PrismaClient } from '@prisma/client';
import { password2hash } from '../src/lib/transform'; // 引用现有的密码加密工具

// 初始化 Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log(`开始执行 Seed 脚本...`);

  const superAdminUsername = 'root';

  // 使用 upsert (update or insert) 确保幂等性
  // 如果用户已存在，则什么都不做；如果不存在，则创建。
  const superAdmin = await prisma.adminUser.upsert({
    where: { username: superAdminUsername },
    update: {},
    create: {
      username: superAdminUsername,
      // !!!重要!!! 请务必替换为一个更安全的密码
      passwordHash: password2hash('123'), 
      role: 'super_admin', //
    },
  });

  console.log(`超级管理员 ${superAdmin.username} 已成功创建或确认存在。`);
  
  const adminUsername = 'admin';
  const admin = await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: password2hash('123456'),
      role: 'admin',
    },
  });
  console.log(`管理员 ${admin.username} 已成功创建或确认存在。`);

  // 你还可以在这里创建默认的租户或其他初始数据
  // 例如:
//   const defaultTenant = await prisma.tenant.upsert({
//     where: { name: '默认租户' },
//     update: {},
//     create: {
//         name: '默认租户',
//         appId: 'default-appid',
//         appSecret: 'default-appsecret',
//         status: 'active',
//         config: {},
//     }
//   });
//   console.log(`默认租户 "${defaultTenant.name}" 已创建。`);

}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed 脚本执行完毕。');
  })
  .catch(async (e) => {
    console.error('Seed 脚本执行失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });