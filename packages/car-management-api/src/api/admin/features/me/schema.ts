import { z } from 'zod';

export const updateMyPasswordSchema = z.object({
  oldPassword: z.string().min(1, 'old password is required'),
  newPassword: z.string().min(6, 'password must be at least 6 characters'),
}); 