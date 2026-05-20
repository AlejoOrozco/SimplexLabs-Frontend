import type { AttendeeSearchResult } from '@/lib/types';
import { AppointmentType } from '@/lib/types';

const GROUP_CUSTOMERS = 'Customers';
const GROUP_SIMPLEX = 'SimplexLabs Team';

export interface DerivedAppointmentTargeting {
  type: AppointmentType;
  /** CRM contact id when the meeting is anchored to a customer row from search. */
  contactId: string | null;
}

/**
 * Maps attendee search groups to the appointment type the API expects.
 * Order: customer presence implies a client↔contact meeting; Simplex staff implies a platform↔client slot.
 */
export function deriveAppointmentTargetingFromAttendees(
  attendees: readonly AttendeeSearchResult[],
): DerivedAppointmentTargeting {
  const hasCustomers = attendees.some((a) => a.group === GROUP_CUSTOMERS);
  if (hasCustomers) {
    const primary = attendees.find((a) => a.group === GROUP_CUSTOMERS);
    return {
      type: AppointmentType.CLIENT_WITH_CONTACT,
      contactId: primary?.id ?? null,
    };
  }

  const hasSimplex = attendees.some((a) => a.group === GROUP_SIMPLEX);
  if (hasSimplex) {
    return { type: AppointmentType.SIMPLEX_WITH_CLIENT, contactId: null };
  }

  return { type: AppointmentType.EXTERNAL, contactId: null };
}
