import { ZodType, z } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(1, 'Username is required').max(100),
    name: z.string().min(1, 'Name is required').max(100),
    password: z.string().min(1, 'Password is required').max(100),
    role: z.enum(['USER', 'ADMIN']),
  });
}
