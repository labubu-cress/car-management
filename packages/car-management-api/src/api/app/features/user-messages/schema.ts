import { z } from "zod";

export const CreateUserMessageSchema = z.object({
  name: z.string().min(1, "姓名为必填项"),
  phone: z.string().min(1, "手机号为必填项"),
  message: z.string().min(1, "内容为必填项"),
});
