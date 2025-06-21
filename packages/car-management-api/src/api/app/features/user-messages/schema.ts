import { z } from 'zod';

export const CreateUserMessageSchema = z.object({
  name: z.string().min(1, '姓名为必填项'),
  contact: z.string().min(1, '联系方式为必填项'),
  content: z.string().min(1, '内容为必填项'),
}); 