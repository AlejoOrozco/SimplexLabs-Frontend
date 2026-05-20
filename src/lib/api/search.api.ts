import { apiGet } from '@/lib/api/client';
import type { AttendeeSearchResult } from '@/lib/types';

export const searchApi = {
  async searchAttendees(query: string, appointmentId?: string): Promise<AttendeeSearchResult[]> {
    const q = query.trim();
    return apiGet<AttendeeSearchResult[]>('/search/attendees', {
      params: {
        q,
        ...(appointmentId ? { appointmentId } : {}),
      },
    });
  },
};
