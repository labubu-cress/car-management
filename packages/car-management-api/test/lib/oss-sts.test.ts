import { createQcloudImgUploadToken } from "@/lib/oss-sts";
import COS from "cos-nodejs-sdk-v5";
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

    it.skipIf(!areCredsAvailable)(
      "should be able to upload a file with the STS token",
      async () => {
        const tenantId = "test-tenant-upload";
        const token = await createQcloudImgUploadToken(tenantId, [
          "cos:PutObject",
          "cos:HeadObject",
          "cos:DeleteObject",
        ]);

        const cos = new COS({
          SecretId: token.secretId,
          SecretKey: token.secretKey,
          XCosSecurityToken: token.sessionToken,
          // Timeout: 10000,
        });

        const testFileName = `test-upload-${Date.now()}.txt`;
        const testFileContent = "Hello, COS!";
        const key = `tenants/${tenantId}/uploads/${testFileName}`;

        try {
          // Upload a file
          const uploadResult = await cos.putObject({
            Bucket: token.bucket,
            Region: token.region,
            Key: key,
            Body: testFileContent,
          });
          expect(uploadResult.statusCode).toBe(200);

          // Verify file exists
          const headResult = await cos.headObject({
            Bucket: token.bucket,
            Region: token.region,
            Key: key,
          });
          expect(headResult.statusCode).toBe(200);
          expect(headResult.headers).toBeDefined();
          expect(headResult.headers?.["content-length"]).toBe(String(testFileContent.length));
        } finally {
          // Clean up the test file
          await cos.deleteObject({
            Bucket: token.bucket,
            Region: token.region,
            Key: key,
          });
        }
      },
      60000,
    );
  });
});
