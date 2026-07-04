import { z } from 'zod';

/** Update a single setting (PUT /api/admin/settings/[id]) — password re-authorizes. */
export const settingUpdateSchema = z.object({
  value: z.string().max(50000).optional(),
  password: z.string({ error: 'Password is required to authorize updates.' })
    .min(1, 'Password is required to authorize updates.'),
});
export type SettingUpdateInput = z.infer<typeof settingUpdateSchema>;
