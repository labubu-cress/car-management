import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AdminAuthEnv } from '../../middleware/auth';
import { updateMyPasswordSchema } from './schema';
import { updateMyPassword } from './service';

const me = new Hono<AdminAuthEnv>();

me.patch(
  '/password',
  zValidator('json', updateMyPasswordSchema),
  async (c) => {
    const { oldPassword, newPassword } = c.req.valid('json');
    const user = c.get('adminUser');

    await updateMyPassword(user.id, oldPassword, newPassword);

    return c.json({
      message: 'Password updated successfully',
    });
  }
);

export default me; 