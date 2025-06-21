import { z } from 'zod';
import { FaqSchema } from './schema';

export type Faq = z.infer<typeof FaqSchema>; 