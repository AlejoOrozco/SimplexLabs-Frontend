import { z } from 'zod';

export const agentKbWriteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(50_000),
  category: z.string().max(100).nullish(),
  isActive: z.boolean().optional(),
});

export const agentKbUpdateSchema = agentKbWriteSchema.partial();

export type AgentKbWriteFormValues = z.infer<typeof agentKbWriteSchema>;
export type AgentKbUpdateFormValues = z.infer<typeof agentKbUpdateSchema>;
