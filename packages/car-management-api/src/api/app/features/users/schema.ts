import { z } from "zod";

export const updatePhoneNumberSchema = z.object({
  code: z.string(),
});

export type UpdatePhoneNumberInput = z.infer<typeof updatePhoneNumberSchema>;
