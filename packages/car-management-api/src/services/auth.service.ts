import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

export const login = async (username: string, password: string): Promise<string | null> => {
  const user = await prisma.adminUser.findUnique({ where: { username } });

  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );
    return token;
  }

  return null;
}; 