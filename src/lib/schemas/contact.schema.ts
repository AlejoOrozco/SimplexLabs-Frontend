import { z } from 'zod';
import { ContactSource } from '@/lib/types';

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email().nullish(),
  phone: z.string().max(30).nullish(),
  source: z.nativeEnum(ContactSource).default(ContactSource.MANUAL),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactDto = z.infer<typeof createContactSchema>;
export type UpdateContactDto = z.infer<typeof updateContactSchema>;
