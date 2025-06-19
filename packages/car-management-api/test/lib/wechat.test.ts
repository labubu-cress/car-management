import { promises as fs } from "fs";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { WeChatClient } from "../../src/lib/wechat";

const INTEGRATION_TEST_TOKEN_FILE_PATH = path.join(__dirname, "../.tmp", "integration-wechat-access-token.json");

// 确保在运行测试前设置以下环境变量
const APPID = process.env.WECHAT_APPID || "";
const APPSECRET = process.env.WECHAT_APPSECRET || "";

describe("WeChatClient Integration Tests", () => {
  // 在每个测试之前清理测试文件
  beforeEach(async () => {
    try {
      await fs.unlink(INTEGRATION_TEST_TOKEN_FILE_PATH);
    } catch (error) {
      // 文件不存在则忽略错误
    }
    // 确保 tmp 目录存在
    await fs.mkdir(path.dirname(INTEGRATION_TEST_TOKEN_FILE_PATH), { recursive: true });
  });

  it.skipIf(!APPID || !APPSECRET)(
    "should fetch a real access token from WeChat server",
    async () => {
      if (!APPID || !APPSECRET) {
        console.warn("WECHAT_APPID or WECHAT_APPSECRET is not set. Skipping integration test.");
        return;
      }

      const client = new WeChatClient(APPID, APPSECRET, INTEGRATION_TEST_TOKEN_FILE_PATH);
      const token = await client.getAccessToken();

      expect(token).toBeTypeOf("string");
      expect(token.length).toBeGreaterThan(0);

      // 验证 token 是否被缓存到文件
      const fileContent = await fs.readFile(INTEGRATION_TEST_TOKEN_FILE_PATH, "utf-8");
      const parsedToken = JSON.parse(fileContent);
      expect(parsedToken.token).toBe(token);
      expect(parsedToken.expiresAt).toBeGreaterThan(Date.now());
    },
    { timeout: 10000 },
  ); // 设置超时时间，因为是网络请求

  it.skipIf(!APPID || !APPSECRET)(
    "should handle code2Session with invalid code for real server",
    async () => {
      if (!APPID || !APPSECRET) {
        console.warn("WECHAT_APPID or WECHAT_APPSECRET is not set. Skipping integration test.");
        return;
      }
      const client = new WeChatClient(APPID, APPSECRET, INTEGRATION_TEST_TOKEN_FILE_PATH);
      const invalidCode = "thisisnotarealcode";
      // 预期会因为无效的 code 而失败
      await expect(client.code2Session(invalidCode)).rejects.toThrow(/invalid code/);
    },
    { timeout: 10000 },
  );

  it.skipIf(!APPID || !APPSECRET)(
    "should handle getPhoneNumber with invalid code for real server",
    async () => {
      if (!APPID || !APPSECRET) {
        console.warn("WECHAT_APPID or WECHAT_APPSECRET is not set. Skipping integration test.");
        return;
      }
      const client = new WeChatClient(APPID, APPSECRET, INTEGRATION_TEST_TOKEN_FILE_PATH);
      const invalidCode = "thisisnotarealphonecode";
      // 预期会因为无效的 code 而失败
      await expect(client.getPhoneNumber(invalidCode)).rejects.toThrow(/invalid code/);
    },
    { timeout: 10000 },
  );
});
