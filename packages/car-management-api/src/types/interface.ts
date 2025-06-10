export interface CarFeature {
  icon: string;
  text: string;
}

export interface CarTrim {
  id: string;
  tenantId: string;
  name: string;
  subtitle: string;
  image: string;
  badge?: string;
  originalPrice: string;
  currentPrice: string;
  features: CarFeature[];
}

export interface CarCategory {
  id: string;
  tenantId: string;
  name: string;
  image: string;
  carTrims: CarTrim[];
  badge?: string;
  tags: string[];
  highlights: CarFeature[];
  interiorImages: string[];
  exteriorImages: string[];
  offerPictures: string[];
}

// 车辆使用场景: "家用"、"商用"、"公务" 等等
export interface VehicleScenario {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  image: string;
  categories: CarCategory[];
}


export interface Tenant {
  id: string;
  // 租户名称: 太平洋保险、公安部门等
  name: string;
  // 小程序的唯一ID
  appId: string;
  // 小程序的 AppSecret
  appSecret: string;
  // 状态
  status: 'active' | 'inactive';
  // 个性化配置
  config: Record<string, unknown>;
}

export interface User {
  id: string;
  tenantId: string;
  nickname: string;
  avatarUrl: string;
  phoneNumber: string;
  // 微信用户的 OpenID
  openId: string;
  // 微信unionID（跨应用统一标识）
  unionId: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  // super_admin: 可以管理所有东西
  // admin: 相当于所有 tenant_admin, 可以管理租户下的所有东西, 但是不能管理租户本身（新增、修改租户等）
  // tenant_admin: 只能管理某个租户下的所有东西
  // tenant_viewer: 只能查看某个租户下的所有东西
  role: 'super_admin' | 'admin' | 'tenant_admin' | 'tenant_viewer';
  // 'super_admin' 和 'admin' 没有 tenantId
  tenantId?: string;
}