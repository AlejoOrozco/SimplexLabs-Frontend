import { z } from 'zod';

export const createWebsiteSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  label: z.string().max(100).nullish(),
  isActive: z.boolean().default(true),
});

export const updateWebsiteSchema = createWebsiteSchema.partial();

export type CreateWebsiteDto = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteDto = z.infer<typeof updateWebsiteSchema>;
