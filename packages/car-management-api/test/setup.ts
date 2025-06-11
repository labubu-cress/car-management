import { afterAll, beforeAll } from "vitest";
import { prisma } from "../src/db/client";
import { clearTestDb } from "./helper";

beforeAll(async () => {
  await clearTestDb(prisma);
  await prisma.$connect();
});

afterAll(async () => {
  await clearTestDb(prisma);
  await prisma.$disconnect();
});
