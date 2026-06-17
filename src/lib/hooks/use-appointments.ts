import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/appointments.api';
import { queryKeys } from '@/lib/hooks/query-keys';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '@/lib/schemas/appointment.schema';
import type { Appointment } from '@/lib/types';

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: queryKeys.appointments.list(),
    queryFn: api.getAppointments,
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery<Appointment>({
    queryKey: queryKeys.appointments.detail(id ?? ''),
    queryFn: () => api.getAppointment(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: api.createAppointment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
    },
  });
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, UpdateAppointmentDto>({
    mutationFn: (dto) => api.updateAppointment(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteAppointment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
    },
  });
}

export function useConfirmAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, string>({
    mutationFn: api.confirmAppointment,
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
    },
  });
}

export function useRequestAppointmentCallback() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, string>({
    mutationFn: api.requestAppointmentCallback,
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
    },
  });
}

export function useMarkAppointmentCallbackHandled(companyId?: string) {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, string>({
    mutationFn: api.markAppointmentCallbackHandled,
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
      if (companyId) {
        void qc.invalidateQueries({ queryKey: ['admin', 'company', companyId, 'appointments'] });
      }
    },
  });
}

export function useRespondToAppointment() {
  const qc = useQueryClient();
  return useMutation<
    Appointment,
    Error,
    { id: string; status: api.RespondToAppointmentDto['status'] }
  >({
    mutationFn: ({ id, status }) => api.respondToAppointment(id, { status }),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.list() });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}
