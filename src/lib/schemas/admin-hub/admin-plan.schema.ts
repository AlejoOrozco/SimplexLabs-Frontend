import { z } from 'zod';
import { Channel, Niche } from '@/lib/types';
import { AdminPlanCategory, AdminPlanTier } from '@/lib/types/admin-hub';

export const adminWritePlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  niche: z.nativeEnum(Niche),
  category: z.nativeEnum(AdminPlanCategory),
  tier: z.nativeEnum(AdminPlanTier).optional(),
  priceMonthly: z.number().nonnegative(),
  priceAnnual: z.number().nonnegative().nullish(),
  setupFee: z.number().nonnegative(),
  maxCampaigns: z.number().int().nonnegative().nullish(),
  description: z.string().max(500).nullish(),
  features: z.array(z.nativeEnum(AdminPlanCategory)).optional(),
  channels: z.array(z.nativeEnum(Channel)).optional(),
});

export const adminUpdatePlanSchema = adminWritePlanSchema.partial();

export const adminUpdatePlanStatusSchema = z.object({
  isActive: z.boolean(),
});

export type AdminWritePlanFormValues = z.infer<typeof adminWritePlanSchema>;
export type AdminUpdatePlanFormValues = z.infer<typeof adminUpdatePlanSchema>;
