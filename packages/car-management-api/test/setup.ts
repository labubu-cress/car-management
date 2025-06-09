import { beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";

// 使用测试专用的 Prisma 客户端
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

beforeAll(async () => {
  // 测试开始前连接数据库
  await testPrisma.$connect();
});

beforeEach(async () => {
  // 每个测试前清理数据
  try {
    await testPrisma.car.deleteMany();
  } catch (error) {
    // 如果表不存在，忽略错误
    console.warn("清理数据时出现警告:", error);
  }
});

afterAll(async () => {
  // 测试结束后清理数据
  try {
    await testPrisma.car.deleteMany();
  } catch (error) {
    // 如果表不存在，忽略错误
    console.warn("清理数据时出现警告:", error);
  }
  // 测试结束后断开连接
  await testPrisma.$disconnect();
});

// 导出 prisma 实例供测试使用
export { testPrisma };
