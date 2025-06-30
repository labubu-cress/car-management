import { HTTPException } from 'hono/http-exception';
import { prisma } from '../../../../lib/db';
import { password2hash, verifyPassword } from '../../../../lib/transform';

export const updateMyPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.adminUser.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  const isOldPasswordValid = verifyPassword(oldPassword, user.passwordHash);

  if (!isOldPasswordValid) {
    throw new HTTPException(400, { message: 'Invalid old password' });
  }

  const newPasswordHash = password2hash(newPassword);

  await prisma.adminUser.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });
}; 