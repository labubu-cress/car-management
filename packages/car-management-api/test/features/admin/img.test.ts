import app from "@/index";
import { prisma } from "@/lib/db";
import * as ossSts from "@/lib/oss-sts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTestDb, createTestTenantAndAdminUsers, type TestAdminUserWithToken } from "../../helper";

describe("Admin API: /api/v1/admin/tenants/:tenantId/img", () => {
  let adminUser: TestAdminUserWithToken;
  let tenantId: string;

  const mockToken = {
    secretId: "mock-secret-id",
    secretKey: "mock-secret-key",
    sessionToken: "mock-session-token",
    region: "mock-region",
    bucket: "mock-bucket",
    expiredTime: 1678886400,
    startTime: 1678882800,
  };

  beforeEach(async () => {
    await clearTestDb(prisma);
    ({ tenantId, adminUser } = await createTestTenantAndAdminUsers(prisma));
    vi.spyOn(ossSts, "createQcloudImgUploadToken").mockResolvedValue(mockToken);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get an upload token", async () => {
    const response = await app.request(`/api/v1/admin/tenants/${tenantId}/img/upload-token`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockToken);
    expect(ossSts.createQcloudImgUploadToken).toHaveBeenCalledWith(tenantId);
  });
});
