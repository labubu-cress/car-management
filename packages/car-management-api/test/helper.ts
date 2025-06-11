import { AdminRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { login } from "../src/services/admin/auth.service";

export const clearTestDb = async (client: PrismaClient) => {
  await client.carTrim.deleteMany();
  await client.carCategory.deleteMany();
  await client.vehicleScenario.deleteMany();
  await client.adminUser.deleteMany();
  await client.user.deleteMany();
  await client.tenant.deleteMany();
};

export type TestAdminUserWithToken = {
  username: string;
  password: string;
  role: AdminRole;
  tenantId?: string;
  token: string;
};
export const createTestAdminUser = async (
  client: PrismaClient,
  role: AdminRole,
  tenantId?: string
): Promise<TestAdminUserWithToken> => {
  const username = `${role}-test-user`;
  const password = "test-secret-password";
  const passwordHash = await bcrypt.hash(password, 10);
  await client.adminUser.create({
    data: {
      username,
      passwordHash,
      role,
      tenantId:
        role === "super_admin" || role === "admin" ? undefined : tenantId,
    },
  });
  const token = await login(username, password);
  return { username, password, role, tenantId, token: token! };
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

  // create a tenant admin user
  const tenantAdminUser = await createTestAdminUser(
    client,
    "tenant_admin",
    tenantId
  );

  // create a tenant viewer user
  const tenantViewerUser = await createTestAdminUser(
    client,
    "tenant_viewer",
    tenantId
  );

  return {
    tenantId,
    superAdminUser,
    adminUser,
    tenantAdminUser,
    tenantViewerUser,
  };
};
