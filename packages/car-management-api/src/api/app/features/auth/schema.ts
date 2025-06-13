import { z } from "zod";

export const appLoginSchema = z.object({
  code: z.string(),
  tenantId: z.string(), // tenantId should be passed from the client
});

export type AppLoginInput = z.infer<typeof appLoginSchema>;
