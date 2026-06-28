import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type { CreateAppointmentDto } from '@/lib/schemas/appointment.schema';
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
