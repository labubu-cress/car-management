import { z } from "zod";
import { carCategorySchema } from "./schema";

export type CarCategory = z.infer<typeof carCategorySchema>;
