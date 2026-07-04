import { z } from 'zod';

/** Admin status update for an inquiry (PUT /api/admin/inquiries/[id]). */
export const inquiryUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed'], { error: 'Invalid status' }),
});
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

/** Public contact/enquiry submission (POST /api/inquiries). */
export const inquiryCreateSchema = z.object({
  name: z.string({ error: 'Name is required.' }).trim().min(1, 'Name is required.').max(200),
  email: z.email('A valid email is required.').max(200),
  phone: z.string().trim().max(50).nullish(),
  subject: z.string().trim().max(300).nullish(),
  message: z.string({ error: 'Message is required.' }).trim().min(1, 'Message is required.').max(5000),
  product: z.string().trim().max(300).nullish(),
  captchaToken: z.string().nullish(),
  captchaAnswer: z.string().nullish(),
});
export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
