import { PrismaClient, AdminUser, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

// Helper to remove password hash
const excludePasswordHash = (user: AdminUser): Omit<AdminUser, 'passwordHash'> => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getAllAdminUsers = async (): Promise<Omit<AdminUser, 'passwordHash'>[]> => {
  const users = await prisma.adminUser.findMany();
  return users.map(excludePasswordHash);
};

export const getAdminUserById = async (id: string): Promise<Omit<AdminUser, 'passwordHash'> | null> => {
  const user = await prisma.adminUser.findUnique({ where: { id } });
  return user ? excludePasswordHash(user) : null;
};

export const createAdminUser = async (data: Prisma.AdminUserCreateInput): Promise<Omit<AdminUser, 'passwordHash'>> => {
  const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);
  const newUser = await prisma.adminUser.create({
    data: {
      ...data,
      passwordHash: hashedPassword,
    },
  });
  return excludePasswordHash(newUser);
};

export const updateAdminUser = async (id: string, data: Prisma.AdminUserUpdateInput): Promise<Omit<AdminUser, 'passwordHash'> | null> => {
  if (data.passwordHash && typeof data.passwordHash === 'string') {
    data.passwordHash = await bcrypt.hash(data.passwordHash, saltRounds);
  }
  const updatedUser = await prisma.adminUser.update({
    where: { id },
    data,
  });
  return updatedUser ? excludePasswordHash(updatedUser) : null;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await prisma.adminUser.delete({ where: { id } });
}; 