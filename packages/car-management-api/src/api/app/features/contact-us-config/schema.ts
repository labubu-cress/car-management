import { z } from "zod";

export const contactUsConfigSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  contactPhoneDescription: z.string().nullable(),
  contactPhoneNumber: z.string().nullable(),
  contactEmailDescription: z.string().nullable(),
  contactEmail: z.string().nullable(),
  workdays: z.array(z.number()).nullable(),
  workStartTime: z.number().nullable(),
  workEndTime: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isServiceTime: z.boolean(),
});
