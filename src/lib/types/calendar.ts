import type { AppointmentStatus, AppointmentType } from '@/lib/types';

export type CalendarScope = 'all' | 'mine';

export interface CalendarOrganizerRef {
  id: string;
  firstName?: string;
  lastName?: string;
}

/** Payload item from `GET /calendar/events` (UTC `start` / `end`). */
export interface CalendarEventRecord {
  id: string;
  title: string;
  start: string;
  end: string;
  type: AppointmentType;
  status: AppointmentStatus;
  callMeAsap?: boolean;
  isRecurring?: boolean;
  organizer?: CalendarOrganizerRef;
}

export interface AvailabilityConflict {
  id: string;
  title: string;
  scheduledAt: string;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts: AvailabilityConflict[];
  withinWorkingHours: boolean;
  workingHoursReason?: string;
}

export interface PendingMove {
  eventId: string;
  newStart: string;
  newEnd: string;
  revert: () => void;
  staffMemberId?: string;
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface MakeRecurringDto {
  frequency: RecurringFrequency;
  count?: number;
  dayOfWeek?: number;
  endDate?: string;
}

export interface CalendarStaffMember {
  id: string;
  name: string;
  role: string;
}
