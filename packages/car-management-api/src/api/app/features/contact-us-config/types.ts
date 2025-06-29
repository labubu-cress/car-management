import { z } from "zod";
import { contactUsConfigSchema } from "./schema";

export type ContactUsConfig = z.infer<typeof contactUsConfigSchema>;
