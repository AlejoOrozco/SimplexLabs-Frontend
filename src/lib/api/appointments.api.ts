import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '@/lib/schemas/appointment.schema';
import type { Appointment, AppointmentInvitationStatus } from '@/lib/types';

export interface RespondToAppointmentDto {
  status: Extract<AppointmentInvitationStatus, 'ACCEPTED' | 'DECLINED'>;
}

export async function getAppointments(): Promise<Appointment[]> {
  return apiGet<Appointment[]>('/appointments');
}

export async function getAppointment(id: string): Promise<Appointment> {
  return apiGet<Appointment>(`/appointments/${id}`);
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  return apiPost<Appointment, CreateAppointmentDto>('/appointments', dto);
}

/** Omit `attendeeUserIds` when not changing invitees; send the full list to replace attendees. */
export async function updateAppointment(
  id: string,
  dto: UpdateAppointmentDto,
): Promise<Appointment> {
  return apiPut<Appointment, UpdateAppointmentDto>(`/appointments/${id}`, dto);
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiDelete<void>(`/appointments/${id}`);
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  return apiPost<Appointment>(`/appointments/${id}/confirm`);
}

export async function requestAppointmentCallback(id: string): Promise<Appointment> {
  return apiPost<Appointment>(`/appointments/${id}/request-callback`);
}

export async function markAppointmentCallbackHandled(id: string): Promise<Appointment> {
  return apiPost<Appointment>(`/appointments/${id}/mark-callback-handled`);
}

export async function respondToAppointment(
  id: string,
  dto: RespondToAppointmentDto,
): Promise<Appointment> {
  return apiPut<Appointment, RespondToAppointmentDto>(`/appointments/${id}/respond`, dto);
}
