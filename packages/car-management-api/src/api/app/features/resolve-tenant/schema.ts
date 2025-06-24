import { z } from "zod";

export const resolveTenantSchema = z.object({
  appId: z.string(),
});
