import { z } from 'zod';

const optionalText = z.string().max(100000).nullish();

/** Fields accepted when creating a blog post (POST /api/admin/blogs). */
export const blogCreateSchema = z.object({
  slug: z.string({ error: 'Slug is required.' }).trim().min(1, 'Slug is required.').max(300),
  title: z.string({ error: 'Title is required.' }).trim().min(1, 'Title is required.').max(500),
  content: z.string({ error: 'Content is required.' }).min(1, 'Content is required.'),
  excerpt: optionalText,
  coverImage: optionalText,
  categoryId: z.string().nullish(),
  tags: optionalText,
  metaTitle: optionalText,
  metaDesc: optionalText,
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});
export type BlogCreateInput = z.infer<typeof blogCreateSchema>;

/** Update accepts any subset of the create fields. */
export const blogUpdateSchema = blogCreateSchema.partial();
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;
