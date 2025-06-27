import { z } from "zod";

export const ContactUsConfigUpdateSchema = z.object({
  contactPhoneDescription: z.string().optional(),
  contactPhoneNumber: z.string().optional(),
  contactEmailDescription: z.string().optional(),
  contactEmail: z.string().optional(),
  workdays: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  workStartTime: z.number().int().min(0).max(23).optional().nullable(),
  workEndTime: z.number().int().min(0).max(23).optional().nullable(),
});
