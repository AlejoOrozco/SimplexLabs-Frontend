import { z } from 'zod';
import { Channel, Niche, PlanFeatureType } from '@/lib/types';

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  niche: z.nativeEnum(Niche),
  priceMonthly: z.number().nonnegative(),
  setupFee: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
  features: z.array(z.nativeEnum(PlanFeatureType)).default([]),
  channels: z.array(z.nativeEnum(Channel)).default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanDto = z.infer<typeof createPlanSchema>;
export type UpdatePlanDto = z.infer<typeof updatePlanSchema>;
