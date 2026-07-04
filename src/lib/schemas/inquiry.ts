import { z } from 'zod';

/** Admin status update for an inquiry (PUT /api/admin/inquiries/[id]). */
export const inquiryUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed'], { error: 'Invalid status' }),
});
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

// NOTE: the public submission route (POST /api/inquiries) uses multipart
// formData (file upload + server-side captcha) and keeps its own validation.
