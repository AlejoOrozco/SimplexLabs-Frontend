import { createAppointment } from '@/lib/api/appointments.api';
import type { CreateAppointmentDto } from '@/lib/schemas/appointment.schema';
import type { Appointment } from '@/lib/types';

/** Platform operator scheduling for a tenant — same POST /appointments body with `companyId`. */
export async function adminCreateCompanyAppointment(
  companyId: string,
  dto: CreateAppointmentDto,
): Promise<Appointment> {
  return createAppointment({ ...dto, companyId });
}
