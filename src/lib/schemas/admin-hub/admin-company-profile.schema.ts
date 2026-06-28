import { z } from 'zod';
import { editCompanyModalSchema } from '@/lib/schemas/company.schema';
import { Niche } from '@/lib/types';

export const adminCompanyProfileSchema = editCompanyModalSchema.extend({
  niche: z.nativeEnum(Niche),
});

export type AdminCompanyProfileFormValues = z.infer<typeof adminCompanyProfileSchema>;
