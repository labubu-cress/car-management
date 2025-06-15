import { z } from "zod";

// 为 highlight 创建一个 Zod schema
export const carFeatureSchema = z.object({
  title: z.string(),
  value: z.string(),
}); 