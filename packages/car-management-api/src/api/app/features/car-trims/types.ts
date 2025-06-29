import { z } from "zod";
import { carTrimSchema, carTrimWithCategorySchema } from "./schema";

export type CarTrim = z.infer<typeof carTrimSchema>;
export type CarTrimWithCategory = z.infer<typeof carTrimWithCategorySchema>;
