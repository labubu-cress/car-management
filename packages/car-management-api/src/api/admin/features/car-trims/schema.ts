import { Prisma } from "@prisma/client";
import { z } from "zod";
import { carFeatureSchema } from "../shared/schema";

export const carTrimSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string().url(),
  badge: z.string().nullable(),
  originalPrice: z.instanceof(Prisma.Decimal).transform((val) => val.toString()),
  currentPrice: z.instanceof(Prisma.Decimal).transform((val) => val.toString()),
  features: z.array(carFeatureSchema),
  categoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CarTrim = z.infer<typeof carTrimSchema>;

// Schema for creating a car trim
export const createCarTrimSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().min(1),
  image: z.string().url(),
  originalPrice: z.coerce.number().positive("价格必须是正数"),
  currentPrice: z.coerce.number().positive("价格必须是正数"),
  badge: z.string().optional(),
  features: z.array(carFeatureSchema).optional().default([]),
  categoryId: z.string().cuid(),
});

// Schema for updating a car trim
export const updateCarTrimSchema = createCarTrimSchema.partial();

export type CreateCarTrimInput = z.infer<typeof createCarTrimSchema>;
export type UpdateCarTrimInput = z.infer<typeof updateCarTrimSchema>;
