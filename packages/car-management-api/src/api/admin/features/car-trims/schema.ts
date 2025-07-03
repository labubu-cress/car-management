import { Prisma } from "@prisma/client";
import { z } from "zod";
import { carFeatureSchema } from "../shared/schema";

const userInFavoriteSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  avatarUrl: z.string(),
  openId: z.string(),
});

export const carTrimSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string().url(),
  configImageUrl: z.string().url().nullable(),
  badge: z.string().nullable(),
  originalPrice: z.instanceof(Prisma.Decimal).transform((val) => val.toString()),
  currentPrice: z.instanceof(Prisma.Decimal).transform((val) => val.toString()),
  priceOverrideText: z.string().nullable(),
  features: z.array(carFeatureSchema),
  categoryId: z.string(),
  displayOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
});

export const carTrimWithFavoritesSchema = carTrimSchema.extend({
  favoritedBy: z
    .array(
      z.object({
        user: userInFavoriteSchema,
        createdAt: z.date(),
      }),
    )
    .default([]),
});

export type CarTrim = z.infer<typeof carTrimSchema>;
export type CarTrimWithFavorites = z.infer<typeof carTrimWithFavoritesSchema>;

// Schema for creating a car trim
export const createCarTrimSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().min(1),
  image: z.string().url(),
  configImageUrl: z.string().url().optional(),
  originalPrice: z.coerce.number().positive("价格必须是正数"),
  currentPrice: z.coerce.number().positive("价格必须是正数"),
  priceOverrideText: z.string().nullish(),
  badge: z.string().optional(),
  features: z.array(carFeatureSchema).optional().default([]),
  categoryId: z.string().cuid(),
});

// Schema for updating a car trim
export const updateCarTrimSchema = createCarTrimSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const reorderCarTrimsSchema = z.object({
  categoryId: z.string().cuid(),
  trimIds: z.array(z.string().cuid()),
});

export type CreateCarTrimInput = z.infer<typeof createCarTrimSchema>;
export type UpdateCarTrimInput = z.infer<typeof updateCarTrimSchema>;
