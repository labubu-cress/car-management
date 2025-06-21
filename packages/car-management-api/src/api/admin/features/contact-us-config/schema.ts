import { z } from "zod";

export const ContactUsConfigUpdateSchema = z.object({
  contactPhoneDescription: z.string().optional(),
  contactPhoneNumber: z.string().optional(),
  contactEmailDescription: z.string().optional(),
  contactEmail: z.string().optional(),
}); 