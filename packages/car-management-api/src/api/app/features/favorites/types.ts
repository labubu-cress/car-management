import { z } from "zod";
import { favoriteCarTrimSchema } from "./schema";

export type FavoriteCarTrim = z.infer<typeof favoriteCarTrimSchema>; 