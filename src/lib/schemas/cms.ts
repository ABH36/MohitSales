import { z } from 'zod';

/**
 * CMS section update (PUT /api/admin/cms/[page]/[section]).
 * `content` is polymorphic — a raw HTML/text string for most sections, or a
 * JSON config object (e.g. promo_popup). It must be present but may be any
 * non-undefined shape; the route serializes and sanitizes it downstream.
 */
export const cmsUpdateSchema = z.object({
  content: z.any().refine((v) => v !== undefined, { message: 'content is required.' }),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export type CmsUpdateInput = z.infer<typeof cmsUpdateSchema>;
