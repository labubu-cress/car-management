import { afterAll, beforeAll } from "vitest";
import { prisma } from "../src/lib/db";
import { clearTestDb } from "./helper";

beforeAll(async () => {
  await clearTestDb(prisma);
  await prisma.$connect();
});

afterAll(async () => {
  await clearTestDb(prisma);
  await prisma.$disconnect();
});
