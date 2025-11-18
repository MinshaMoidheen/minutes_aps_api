import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().max(50).email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).optional(),
});

export const LoginSchema = z.object({
  email: z.string().max(50).email(),
  password: z.string().min(8),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});
