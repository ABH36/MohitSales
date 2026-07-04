import { z } from 'zod';

const optionalText = z.string().max(20000).nullish();

/** Fields accepted when creating a category (POST /api/admin/categories). */
export const categoryCreateSchema = z.object({
  slug: z.string({ error: 'Slug is required.' }).trim().min(1, 'Slug is required.').max(300),
  name: z.string({ error: 'Name is required.' }).trim().min(1, 'Name is required.').max(300),
  description: optionalText,
  image: optionalText,
  parentId: z.string().nullish(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

/** Update accepts any subset of the create fields. */
export const categoryUpdateSchema = categoryCreateSchema.partial();
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
