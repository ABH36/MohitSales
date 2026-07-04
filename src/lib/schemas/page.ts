import { z } from 'zod';

/** Page content (POST /api/admin/pages, PUT /api/admin/pages/[id]). */
export const pageCreateSchema = z.object({
  slug: z.string({ error: 'Slug is required.' }).trim().min(1, 'Slug is required.').max(300),
  htmlContent: z.string({ error: 'HTML content is required.' }).min(1, 'HTML content is required.'),
  title: z.string().max(500).nullish(),
  heading: z.string().max(500).nullish(),
  legacyPath: z.string().max(300).nullish(),
  isActive: z.boolean().optional(),
});
export type PageCreateInput = z.infer<typeof pageCreateSchema>;

export const pageUpdateSchema = pageCreateSchema.partial();
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>;
