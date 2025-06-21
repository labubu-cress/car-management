import { login } from "@/api/admin/features/auth/service";
import { password2hash } from "@/lib/transform";
import { AdminRole, type AdminUser, type PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export const clearTestDb = async (client: PrismaClient) => {
  const tableNames = [
    "UserFavoriteCarTrim",
    "CarTrim",
    "CarCategory",
    "VehicleScenario",
    "HomepageConfig",
    "User",
    "AdminUser",
    "Tenant",
  ];
  for (const tableName of tableNames) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client as any)[tableName].deleteMany({});
  }
};

export type TestAdminUserWithToken = Partial<AdminUser> & {
  token: string;
  password?: string;
  username: string;
};

export type TestTenant = {
  id: string;
  name: string;
  appId: string;
  appSecret: string;
};

const createToken = async (adminUser: AdminUser) => {
  return await new SignJWT({
    userId: adminUser.id,
    tenantId: adminUser.tenantId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
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

export const createTestTenantAndAdminUsers = async (
  prisma: PrismaClient,
): Promise<{
  tenantId: string;
  adminUser: TestAdminUserWithToken;
  superAdminUser: TestAdminUserWithToken;
}> => {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Test Tenant",
      appId: "test-app-id",
      appSecret: "test-app-secret",
    },
  });
  const tenantId = tenant.id;

  const adminUserData = {
    username: "test-admin",
    password: "password",
  };

  const hashedPassword = await password2hash(adminUserData.password);

  const adminUser = await prisma.adminUser.create({
    data: {
      tenantId,
      username: adminUserData.username,
      passwordHash: hashedPassword,
      role: AdminRole.admin,
    },
  });

  const superAdminUserData = {
    username: "test-super-admin",
    password: "password",
  };
  const superAdminHashedPassword = await password2hash(
    superAdminUserData.password,
  );
  const superAdminUser = await prisma.adminUser.create({
    data: {
      tenantId,
      username: superAdminUserData.username,
      passwordHash: superAdminHashedPassword,
      role: AdminRole.super_admin,
    },
  });

  const adminToken = await createToken(adminUser);
  const superAdminToken = await createToken(superAdminUser);

  return {
    tenantId,
    adminUser: { ...adminUser, token: adminToken },
    superAdminUser: { ...superAdminUser, token: superAdminToken },
  };
};

export const createAdminUserForTenant = async (
  prisma: PrismaClient,
  tenantId: string,
): Promise<TestAdminUserWithToken> => {
  const adminUserData = {
    username: "test-admin-for-seed",
    password: "password",
  };
  const hashedPassword = await bcrypt.hash(adminUserData.password, 10);

  const createdAdmin = await prisma.adminUser.create({
    data: {
      tenantId,
      username: adminUserData.username,
      passwordHash: hashedPassword,
      role: AdminRole.admin,
    },
  });

  const token = await createToken(createdAdmin);

  return { ...createdAdmin, token: token, password: adminUserData.password };
};
