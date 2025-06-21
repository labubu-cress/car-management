import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AdminAuthTenantEnv } from '../../middleware/auth';
import { CreateFaqSchema, ListFaqSchema, UpdateFaqSchema } from './schema';
import * as faqService from './service';

const faqs = new Hono<AdminAuthTenantEnv>();

faqs.get('/', zValidator('query', ListFaqSchema), async (c) => {
  const { tenantId } = c.var;
  const { page, pageSize } = c.req.valid('query');
  const { faqs, total } = await faqService.find(tenantId, { page, pageSize });
  return c.json({
    items: faqs,
    total,
  });
});

faqs.post('/', zValidator('json', CreateFaqSchema), async (c) => {
  const { tenantId } = c.var;
  const data = c.req.valid('json');
  const faq = await faqService.create(tenantId, data);
  return c.json(faq, 201);
});

faqs.get('/:id', async (c) => {
  const { tenantId } = c.var;
  const id = c.req.param('id');
  const faq = await faqService.findById(tenantId, id);
  if (!faq) {
    return c.json({ message: 'Faq not found' }, 404);
  }
  return c.json(faq);
});

faqs.put('/:id', zValidator('json', UpdateFaqSchema), async (c) => {
  const { tenantId } = c.var;
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const faq = await faqService.update(tenantId, id, data);
  return c.json(faq);
});

faqs.delete('/:id', async (c) => {
  const { tenantId } = c.var;
  const id = c.req.param('id');
  await faqService.remove(tenantId, id);
  return c.body(null, 204);
});

export default faqs; 