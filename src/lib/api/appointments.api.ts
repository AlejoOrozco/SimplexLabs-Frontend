import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '@/lib/schemas/appointment.schema';
import type { Appointment } from '@/lib/types';

export async function getAppointments(): Promise<Appointment[]> {
  return apiGet<Appointment[]>('/appointments');
}

export async function getAppointment(id: string): Promise<Appointment> {
  return apiGet<Appointment>(`/appointments/${id}`);
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  return apiPost<Appointment, CreateAppointmentDto>('/appointments', dto);
}

export async function updateAppointment(
  id: string,
  dto: UpdateAppointmentDto,
): Promise<Appointment> {
  return apiPut<Appointment, UpdateAppointmentDto>(`/appointments/${id}`, dto);
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiDelete<void>(`/appointments/${id}`);
}
