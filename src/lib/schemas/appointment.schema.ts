import { z } from 'zod';
import { AppointmentType } from '@/lib/types';

/** Create body — server assigns initial `status` (e.g. PENDING); do not send `status`. */
export const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullish(),
  type: z.nativeEnum(AppointmentType),
  scheduledAt: z.string().datetime({ message: 'Invalid date' }),
  durationMinutes: z.number().int().min(5).max(24 * 60),
  contactId: z.string().cuid().nullish(),
  productId: z.string().cuid().nullish(),
  meetingUrl: z.string().url().nullish(),
  externalAttendeeName: z.string().max(100).nullish(),
  externalAttendeeEmail: z.string().email().nullish(),
  attendeeUserIds: z.array(z.string().min(1)).optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

/** Form validation before `type` is derived from attendee selection. */
export const appointmentFormSchema = createAppointmentSchema.omit({ type: true });

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
export type AppointmentFormDto = z.infer<typeof appointmentFormSchema>;
