import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCreateCompanyAppointment } from '@/lib/api/admin-appointments.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type { CreateAppointmentDto } from '@/lib/schemas/appointment.schema';
import type { Appointment } from '@/lib/types';

export function useAdminCreateCompanyAppointment(companyId: string) {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: (dto) => adminCreateCompanyAppointment(companyId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: ['admin', 'company', companyId, 'appointments'] });
    },
  });
}
