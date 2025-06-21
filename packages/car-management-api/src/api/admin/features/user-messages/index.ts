import type { AdminAuthTenantEnv } from '@/api/admin/middleware/auth';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { UserMessageQuerySchema } from './schema';
import * as service from './service';

const app = new Hono<AdminAuthTenantEnv>();

app.get('/', zValidator('query', UserMessageQuerySchema), async (c) => {
  const tenantId = c.get('tenantId');
  const query = c.req.valid('query');
  const { messages, total } = await service.find(tenantId, query);
  return c.json({
    items: messages,
    total,
  });
});

export default app; 