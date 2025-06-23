import { z } from "zod";

export const PagenationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(10),
});

export const FaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  icon: z.string(),
});

export const ListFaqSchema = PagenationSchema;

export const CreateFaqSchema = z.object({
  question: z.string().min(1, "question is required"),
  answer: z.string().min(1, "answer is required"),
  icon: z.string().min(1, "icon is required"),
});

export const UpdateFaqSchema = z.object({
  question: z.string().min(1, "question is required"),
  answer: z.string().min(1, "answer is required"),
  icon: z.string().min(1, "icon is required"),
});
