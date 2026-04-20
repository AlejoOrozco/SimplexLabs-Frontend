import { z } from 'zod';
import { AppointmentStatus, AppointmentType } from '@/lib/types';

export const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullish(),
  type: z.nativeEnum(AppointmentType),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  scheduledAt: z.string().datetime({ message: 'Invalid date' }),
  durationMinutes: z.number().int().min(5).max(24 * 60),
  contactId: z.string().cuid().nullish(),
  productId: z.string().cuid().nullish(),
  meetingUrl: z.string().url().nullish(),
  externalAttendeeName: z.string().max(100).nullish(),
  externalAttendeeEmail: z.string().email().nullish(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
