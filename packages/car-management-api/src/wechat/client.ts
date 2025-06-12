import axios from "axios";
import { findUpSync } from "find-up";
import { promises as fs } from "fs";
import path from "path";

// 接口定义

/**
 * 存储在文件或内存中的 AccessToken 对象结构
 */
interface AccessToken {
  token: string;
  /** Token 的过期时间戳 (毫秒) */
  expiresAt: number;
}

/**
 * 微信 code2Session 接口的成功返回体
 */
interface Code2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  /** 错误码，成功时不存在 */
  errcode?: number;
  /** 错误信息 */
  errmsg?: string;
}

/**
 * 微信 getuserphonenumber 接口的返回体
 */
interface GetPhoneNumberResponse {
  errcode: number;
  errmsg: string;
  phone_info?: {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
    watermark: {
      timestamp: number;
      appid: string;
    };
  };
}

/**
 * 微信小程序服务端 API 客户端
 * 封装了常用的接口，并自动管理 access_token 的获取和刷新。
 */
class WeChatClient {
  private readonly appId: string;
  private readonly appSecret: string;
  /** access_token 的本地缓存文件路径 */
  private readonly tokenFilePath: string;
  /** 内存中的 access_token 缓存 */
  private accessToken: AccessToken | null = null;

  constructor(appId: string, appSecret: string, tokenFilePath: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.tokenFilePath = tokenFilePath;
  }

  /**
   * 从本地文件读取并验证 token
   * @returns 如果 token 有效则返回 AccessToken 对象，否则返回 null
   */
  private async readTokenFromFile(): Promise<AccessToken | null> {
    try {
      // 确保目录存在，如果不存在则创建
      await fs.mkdir(path.dirname(this.tokenFilePath), { recursive: true });
      const data = await fs.readFile(this.tokenFilePath, "utf-8");
      const token = JSON.parse(data) as AccessToken;
      // 验证 token 是否过期
      if (token.expiresAt > Date.now()) {
        return token;
      }
      return null;
    } catch (error) {
      // 文件不存在或内容错误等情况，都视为无效
      return null;
    }
  }

  /**
   * 将 AccessToken 对象写入本地文件
   * @param token 要写入的 AccessToken 对象
   */
  private async writeTokenToFile(token: AccessToken): Promise<void> {
    await fs.writeFile(this.tokenFilePath, JSON.stringify(token), "utf-8");
  }

  /**
   * 获取有效的 access_token
   * 优先从内存和本地文件缓存中读取，缓存无效时再从微信服务器获取。
   * 实现了微信官方推荐的缓存和刷新机制。
   * @returns 有效的 access_token 字符串
   */
  async getAccessToken(): Promise<string> {
    // 1. 优先从内存读取
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) {
      return this.accessToken.token;
    }

    // 2. 内存中没有或已过期，则尝试从文件读取
    this.accessToken = await this.readTokenFromFile();
    if (this.accessToken) {
      return this.accessToken.token;
    }

    // 3. 文件中也没有或已过期，则从微信服务器获取
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
    const response = await axios.get<{
      access_token: string;
      expires_in: number;
    }>(url);

    if (response.data.access_token) {
      // 4. 获取成功后，保存到缓存
      const newToken: AccessToken = {
        token: response.data.access_token,
        // 微信返回的 expires_in 是秒，需要转换为毫秒的时间戳
        // 提前 5 分钟 (300 秒) 刷新，以防止网络延迟等导致 token 在使用时刚好过期
        expiresAt: Date.now() + (response.data.expires_in - 300) * 1000, // 提前5分钟刷新
      };
      this.accessToken = newToken;
      await this.writeTokenToFile(newToken);
      return newToken.token;
    } else {
      // 如果获取失败，则抛出错误
      throw new Error("Failed to get access token");
    }
  }

  /**
   * 使用 code 换取用户的 openid 和 session_key
   * @param code 小程序端通过 `wx.login()` 获取的 code
   * @returns 包含 openid 和 session_key 的对象
   */
  async code2Session(code: string): Promise<Code2SessionResponse> {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;
    const response = await axios.get<Code2SessionResponse>(url);
    if (response.data.errcode) {
      throw new Error(`Failed to get session: ${response.data.errmsg}`);
    }
    return response.data;
  }

  /**
   * 使用 code 换取用户的手机号
   * @param code 小程序端通过 `getPhoneNumber` 事件获取的 code
   * @returns 包含用户手机号信息的对象
   */
  async getPhoneNumber(code: string): Promise<GetPhoneNumberResponse["phone_info"]> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    const response = await axios.post<GetPhoneNumberResponse>(url, { code });
    if (response.data.errcode !== 0) {
      throw new Error(`Failed to get phone number: ${response.data.errmsg}`);
    }
    return response.data.phone_info;
  }
}

// --- 初始化与导出 ---

// 从环境变量中读取小程序的 AppID 和 AppSecret
// 确保在生产环境中通过环境变量配置，而不是硬编码
const appId = process.env.WECHAT_APPID;
const appSecret = process.env.WECHAT_APPSECRET;

// 向上查找 package.json，找到项目根目录
// 将 token 缓存文件存储在项目根目录下的 `tmp` 文件夹中
const packageJsonPath = findUpSync("package.json");
const projectRoot = packageJsonPath ? path.dirname(packageJsonPath) : process.cwd();
const defaultAccessTokenFilePath = path.join(projectRoot, "tmp", "wechat-access-token.json");

// 如果环境变量未设置，打印警告信息，以便开发者发现配置问题
if (!appId || !appSecret) {
  console.warn(
    "WeChat AppID or AppSecret is not configured. Please set WECHAT_APPID and WECHAT_APPSECRET environment variables.",
  );
}

// 创建 WeChatClient 的单例，供整个应用使用
// 即使 appId 或 appSecret 为空字符串，也创建实例，避免在应用启动时因配置缺失而崩溃
// 具体的接口调用会在执行时因 appId 无效而失败
export const wechatClient = new WeChatClient(appId || "", appSecret || "", defaultAccessTokenFilePath);
