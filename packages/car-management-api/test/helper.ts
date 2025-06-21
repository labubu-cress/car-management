import { login } from "@/api/admin/features/auth/service";
import * as appAuthService from "@/api/app/features/auth/service";
import { password2hash } from "@/lib/transform";
import { AdminRole, PrismaClient, type User } from "@prisma/client";

export const clearTestDb = async (client: PrismaClient) => {
  await client.contactUsConfig.deleteMany();
  await client.homepageConfig.deleteMany();
  await client.userFavoriteCarTrim.deleteMany();
  await client.userMessage.deleteMany();
  await client.carTrim.deleteMany();
  await client.carCategory.deleteMany();
  await client.vehicleScenario.deleteMany();
  await client.adminUser.deleteMany();
  await client.user.deleteMany();
  await client.tenant.deleteMany();
};

export type TestAdminUserWithToken = {
  id: string;
  username: string;
  password: string;
  role: AdminRole;
  tenantId?: string | null;
  token: string;
};

export type TestTenant = {
  id: string;
  name: string;
  appId: string;
  appSecret: string;
};

export type TestUser = User;

export const createTestUser = async (client: PrismaClient, tenantId: string) => {
  const user = await client.user.create({
    data: {
      tenantId: tenantId,
      openId: "test_openid_for_user_message",
      unionId: "test_unionid_for_user_message",
      nickname: "Test User for Message",
      avatarUrl: "",
      phoneNumber: "",
    },
  });
  return user;
};

export const getTestAppUserToken = async (user: TestUser) => {
  const { token } = await appAuthService.generateUserToken(user);
  return token;
};

export const createTestAdminUser = async (
  client: PrismaClient,
  role: AdminRole,
  tenantId?: string,
): Promise<TestAdminUserWithToken> => {
  const username = `${role}-test-user`;
  const password = "test-secret-password";
  const passwordHash = password2hash(password);
  await client.adminUser.create({
    data: {
      username,
      passwordHash,
      role,
      tenantId: role === "super_admin" || role === "admin" ? undefined : tenantId,
    },
  });
  const loginResult = await login(username, password);
  const { user, token } = loginResult!;
  return {
    id: user.id,
    username: user.username,
    password,
    role: user.role,
    tenantId: user.tenantId,
    token,
  };
};

export const createTestTenant = async (client: PrismaClient) => {
  const { id, name, appId, appSecret } = await client.tenant.create({
    data: {
      name: "Test Tenant",
      appId: "test-app-id",
      appSecret: "a-secure-secret",
    },
  });
  return {
    id,
    name,
    appId,
    appSecret,
  };
};

export const createTestTenantAndAdminUsers = async (client: PrismaClient) => {
  const { id: tenantId } = await client.tenant.create({
    data: {
      name: "Test Tenant for Admin",
      appId: "test-admin-app-id",
      appSecret: "a-secure-secret-for-admin",
    },
  });

  // create a super admin user
  const superAdminUser = await createTestAdminUser(client, "super_admin");

  // create a admin user
  const adminUser = await createTestAdminUser(client, "admin");

  return {
    tenantId,
    superAdminUser,
    adminUser,
  };
};
