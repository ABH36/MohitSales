import { z } from 'zod';

const optionalText = z.string().max(20000).nullish();

/** Fields accepted when creating a product (POST /api/admin/products). */
export const productCreateSchema = z.object({
  slug: z.string({ error: 'Slug is required.' }).trim().min(1, 'Slug is required.').max(300),
  title: z.string({ error: 'Title is required.' }).trim().min(1, 'Title is required.').max(300),
  description: optionalText,
  features: optionalText,
  imageSrc: optionalText,
  categoryId: z.string().nullish(),
  datasheetLink: optionalText,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  stock: z.number().int().min(0).optional(),
  metaTitle: optionalText,
  metaDescription: optionalText,
  metaKeywords: optionalText,
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

/** Update accepts any subset of the create fields (PUT /api/admin/products/[id]). */
export const productUpdateSchema = productCreateSchema.partial();
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
