import { z } from "zod";
import { carFeatureSchema } from "../shared/schema";
import { vehicleScenarioSchema } from "../vehicle-scenarios/schema";

// 为整个 CarCategory 模型创建一个包含解析后 JSON 字段的 Zod schema
export const carCategorySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  image: z.string().url(),
  badge: z.string().nullable(),
  tags: z.array(z.string()), // 之前是 z.any() 或未定义
  highlights: z.array(carFeatureSchema), // 之前是 z.any() 或未定义
  interiorImages: z.array(z.string().url()),
  exteriorImages: z.array(z.string().url()),
  offerPictures: z.array(z.string().url()),
  createdAt: z.date(),
  updatedAt: z.date(),
  vehicleScenario: vehicleScenarioSchema.optional(),
});

// 从 schema 推断出 TypeScript 类型
export type CarCategory = z.infer<typeof carCategorySchema>;

// API 输入的 Schema
export const createCarCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
  badge: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  highlights: z.array(carFeatureSchema).optional().default([]),
  interiorImages: z.array(z.string().url()).optional().default([]),
  exteriorImages: z.array(z.string().url()).optional().default([]),
  offerPictures: z.array(z.string().url()).optional().default([]),
  vehicleScenarioId: z.string(),
});

export const updateCarCategorySchema = createCarCategorySchema.partial();

export type CreateCarCategoryInput = z.infer<typeof createCarCategorySchema>;
export type UpdateCarCategoryInput = z.infer<typeof updateCarCategorySchema>;
