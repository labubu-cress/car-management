import app from "@/index";
import { prisma } from "@/lib/db";
import type { Faq } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { clearTestDb, createTestTenant, type TestTenant } from "../../helper";

describe("App API: /api/v1/app/tenants/:tenantId/faqs", () => {
  let tenant: TestTenant;

  beforeEach(async () => {
    await clearTestDb(prisma);
    tenant = await createTestTenant(prisma);

    await prisma.faq.create({
      data: {
        question: "Test Question 1?",
        answer: "Test Answer 1.",
        tenantId: tenant.id,
      },
    });

    await prisma.faq.create({
        data: {
          question: "Test Question 2?",
          answer: "Test Answer 2.",
          tenantId: tenant.id,
        },
      });
  });

  it("should get all faqs for the tenant", async () => {
    const response = await app.request(`/api/v1/app/tenants/${tenant.id}/faqs`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as Faq[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0].question).toBe("Test Question 1?");
    expect(body[0].tenantId).toBe(tenant.id);
  });
}); 