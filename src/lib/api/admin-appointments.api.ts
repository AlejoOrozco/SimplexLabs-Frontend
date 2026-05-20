import { apiPost } from '@/lib/api/client';
import type { CreateAppointmentDto } from '@/lib/schemas/appointment.schema';
import type { Appointment } from '@/lib/types';

/** Tenant is taken from the path; JWT identifies the operator. */
export async function adminCreateCompanyAppointment(
  companyId: string,
  dto: CreateAppointmentDto,
): Promise<Appointment> {
  return apiPost<Appointment, CreateAppointmentDto>(
    `/admin/companies/${encodeURIComponent(companyId)}/appointments`,
    dto,
  );
}
