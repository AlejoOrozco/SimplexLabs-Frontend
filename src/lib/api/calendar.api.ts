import { apiGet, apiPost, apiPut } from '@/lib/api/client';
import type {
  AvailabilityResult,
  CalendarEventRecord,
  CalendarStaffMember,
  MakeRecurringDto,
} from '@/lib/types/calendar';

export interface CalendarEventsQuery {
  start: string;
  end: string;
  staffMemberId?: string;
  scope?: 'all' | 'mine';
}

export interface CheckAvailabilityBody {
  proposedStart: string;
  durationMinutes: number;
  staffMemberId?: string;
  excludeAppointmentId?: string;
}

export async function getCalendarEvents(params: CalendarEventsQuery): Promise<CalendarEventRecord[]> {
  return apiGet<CalendarEventRecord[]>('/calendar/events', {
    params: {
      start: params.start,
      end: params.end,
      staffMemberId: params.staffMemberId,
      scope: params.scope,
    },
  });
}

export async function checkCalendarAvailability(
  data: CheckAvailabilityBody,
): Promise<AvailabilityResult> {
  return apiPost<AvailabilityResult, CheckAvailabilityBody>('/calendar/check-availability', data);
}

export async function moveCalendarAppointment(
  id: string,
  body: { newStart: string; newEnd: string },
): Promise<void> {
  await apiPut(`/calendar/appointments/${id}/move`, body);
}

export async function makeCalendarAppointmentRecurring(
  id: string,
  data: MakeRecurringDto,
): Promise<void> {
  await apiPost(`/calendar/appointments/${id}/recurring`, data);
}

export async function getCalendarStaff(): Promise<CalendarStaffMember[]> {
  return apiGet<CalendarStaffMember[]>('/calendar/staff');
}
