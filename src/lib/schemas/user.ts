import { z } from 'zod';

/** Create an admin user (POST /api/admin/users). */
export const userCreateSchema = z.object({
  name: z.string().max(200).nullish(),
  email: z.email('A valid email is required.').max(200),
  password: z.string({ error: 'Password is required.' }).min(6, 'Password must be at least 6 characters.').max(200),
  roleId: z.string({ error: 'Role is required.' }).min(1, 'Role is required.'),
  isActive: z.boolean().optional(),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

/** Update an admin user — all fields optional; password (if present) re-validated. */
export const userUpdateSchema = z.object({
  name: z.string().max(200).nullish(),
  email: z.email('A valid email is required.').max(200).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(200).optional().or(z.literal('')),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
