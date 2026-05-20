import { z } from 'zod';
import { Niche } from '@/lib/types';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  niche: z.nativeEnum(Niche),
  phone: z.string().max(30).nullish(),
  address: z.string().max(300).nullish(),
  notificationPhone: z.string().max(30).nullish(),
  notificationEmail: z.union([z.string().email().max(254), z.literal(''), z.null()]).optional(),
  whatsappPhoneNumberId: z.string().max(120).nullish(),
  whatsappPhoneNumber: z.string().max(30).nullish(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;

/** Admin / company-admin edit dialog — name required; niche is not edited here. */
export const editCompanyModalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(30).nullish(),
  address: z.string().max(300).nullish(),
  notificationPhone: z.string().max(30).nullish(),
  notificationEmail: z.union([z.string().email().max(254), z.literal(''), z.null()]).optional(),
  whatsappPhoneNumberId: z.string().max(120).nullish(),
  whatsappPhoneNumber: z.string().max(30).nullish(),
});

export type EditCompanyModalFormValues = z.infer<typeof editCompanyModalSchema>;
