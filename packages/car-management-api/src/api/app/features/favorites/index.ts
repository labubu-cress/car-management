import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppAuthEnv } from '../../middleware/auth';
import * as favoriteService from './service';

const favorites = new Hono<AppAuthEnv>();

favorites.get('/', async (c) => {
  const user = c.get('user');
  const result = await favoriteService.getFavorites(user.id);
  return c.json(result);
});

const addFavoriteSchema = z.object({
  carTrimId: z.string(),
});

favorites.post('/', zValidator('json', addFavoriteSchema), async (c) => {
  const user = c.get('user');
  const { carTrimId } = c.req.valid('json');
  await favoriteService.addFavorite(user.id, carTrimId);
  return c.json({ success: true }, 201);
});

favorites.delete('/:carTrimId', async (c) => {
  const user = c.get('user');
  const carTrimId = c.req.param('carTrimId');
  await favoriteService.removeFavorite(user.id, carTrimId);
  return c.json({ success: true });
});

// A route to check if a car trim is favorited by the user.
favorites.get('/status/:carTrimId', async (c) => {
  const user = c.get('user');
  const carTrimId = c.req.param('carTrimId');
  const isFavorite = await favoriteService.isFavorite(user.id, carTrimId);
  return c.json({ isFavorite });
});

export default favorites; 