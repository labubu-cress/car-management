import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppAuthEnv } from '../../middleware/auth';
import { CreateUserMessageSchema } from './schema';
import { createUserMessage } from './service';

const app = new Hono<AppAuthEnv>();

app.post(
  '/',
  zValidator('json', CreateUserMessageSchema),
  async (c) => {
    const body = c.req.valid('json');
    const tenant = c.get('tenant' as any);
    const user = c.get('user');

    const message = await createUserMessage(body, tenant, user);

    return c.json(message);
  },
);

export default app; 