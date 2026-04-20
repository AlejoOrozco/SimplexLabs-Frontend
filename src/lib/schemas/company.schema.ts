import { z } from 'zod';
import { Niche } from '@/lib/types';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  niche: z.nativeEnum(Niche),
  phone: z.string().max(30).nullish(),
  address: z.string().max(300).nullish(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
