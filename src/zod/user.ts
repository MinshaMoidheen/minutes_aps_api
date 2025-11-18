import { z } from 'zod';

const Email = z.string().max(50).email();
const Password = z.string().min(8);
const Username = z.string().max(20);
const Name = z.string().max(20);
const Url100 = z.string().url().max(100);

export const UpdateUserSchema = z.object({
  username: Username.optional(),
  email: Email.optional(),
  password: Password.optional(),
  company: z.string().max(100).optional(),
  refAdmin: z.string().optional(),
  designation: z.string().max(50).optional(),
 
  first_name: Name.optional(),
  last_name: Name.optional(),
  website: Url100.optional(),
  facebook: Url100.optional(),
  instagram: Url100.optional(),
  linkedin: Url100.optional(),
  x: Url100.optional(),
  youtube: Url100.optional(),
});

export const CreateUserSchema = z.object({
  email: Email,
  password: Password,
  username: Username.optional(),
  company: z.string().max(100).optional(),
  role: z.enum(['admin', 'user', 'superadmin']).optional(),
  refAdmin: z.string().optional(),
  designation: z.string().max(50).optional(),
 
});

export const UserIdParamSchema = z.object({ userId: z.string() });
export const QueryLimitOffset = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const UserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'user']).optional(),
  isActive: z.coerce.boolean().optional(),
  isEmailVerified: z.coerce.boolean().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(['username', 'email', 'firstName', 'lastName', 'role', 'company', 'designation', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});