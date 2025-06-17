import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import { describe, expect, it } from "vitest";

describe("oss-sts", () => {
  describe("createQcloudImgUploadToken", () => {
    const areCredsAvailable =
      process.env.QCLOUD_SECRET_ID &&
      process.env.QCLOUD_SECRET_KEY &&
      process.env.QCLOUD_COS_BUCKET &&
      process.env.QCLOUD_COS_REGION &&
      process.env.QCLOUD_APP_ID;

    it.skipIf(!areCredsAvailable)(
      "should return a valid STS token from QCloud",
      async () => {
        const tenantId = "test-tenant";
        const token = await createQcloudImgUploadToken(tenantId);

        expect(token).toBeTypeOf("object");
        expect(token).toHaveProperty("secretId");
        expect(token).toHaveProperty("secretKey");
        expect(token).toHaveProperty("sessionToken");
        expect(token).toHaveProperty("region");
        expect(token).toHaveProperty("bucket");
        expect(token).toHaveProperty("expiredTime");
        expect(token).toHaveProperty("startTime");

        expect(token.secretId).not.toBe("");
        expect(token.secretKey).not.toBe("");
        expect(token.sessionToken).not.toBe("");
        expect(token.region).toBe(process.env.QCLOUD_COS_REGION);
        expect(token.bucket).toBe(process.env.QCLOUD_COS_BUCKET);
      },
      60000, // 60s timeout for this test
    );
  });
});
