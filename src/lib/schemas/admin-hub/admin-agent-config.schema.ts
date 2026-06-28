import { z } from 'zod';
import { Channel } from '@/lib/types';

export const adminUpdateAgentConfigSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  fallbackMessage: z.string().min(1).max(2000).optional(),
  escalationMessage: z.string().min(1).max(2000).optional(),
  channels: z.array(z.nativeEnum(Channel)).min(1).optional(),
  language: z.string().min(2).max(10).optional(),
});

export type AdminUpdateAgentConfigFormValues = z.infer<typeof adminUpdateAgentConfigSchema>;

/** Full form validation for the Manage → Agent section (PUT sends all fields). */
export const adminAgentConfigFormSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required').max(120),
  fallbackMessage: z.string().trim().min(1, 'Fallback message is required').max(2000),
  escalationMessage: z.string().trim().min(1, 'Escalation message is required').max(2000),
  channels: z.array(z.nativeEnum(Channel)).min(1, 'Select at least one channel'),
  language: z.string().trim().min(2).max(10),
});

export type AdminAgentConfigFormValues = z.infer<typeof adminAgentConfigFormSchema>;
