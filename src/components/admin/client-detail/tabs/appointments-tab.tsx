'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminScheduleSimplexDialog } from '@/components/admin/client-detail/admin-schedule-simplex-dialog';
import { getAppointments } from '@/lib/api/appointments.api';
import { appointmentNeedsCallback } from '@/lib/appointments/callback-utils';
import { useMarkAppointmentCallbackHandled } from '@/lib/hooks/use-appointments';
import { notify } from '@/lib/toast';
import { appointmentStatusLabel, appointmentTypeLabel, formatDateTime } from '@/lib/utils/format';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const CalendarView = dynamic(
  () => import('@/components/calendar/calendar-view').then((m) => m.CalendarView),
  { ssr: false, loading: () => <LoadingSpinner /> },
);

interface AppointmentsTabProps {
  companyId: string;
}

export function AppointmentsTab({ companyId }: AppointmentsTabProps): JSX.Element {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const markCalled = useMarkAppointmentCallbackHandled(companyId);

  const query = useQuery({
    queryKey: ['admin', 'company', companyId, 'appointments'],
    queryFn: getAppointments,
  });

  const rows = useMemo(() => {
    const all = query.data ?? [];
    return all
      .filter((a) => a.companyId === companyId)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }, [query.data, companyId]);

  if (query.isLoading) {
    return <p className="text-sm text-text-secondary">Loading appointments…</p>;
  }
  if (query.isError) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4 text-sm text-error-dark">
        Could not load appointments.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-secondary">
          SimplexLabs-with-client and client appointments for this tenant.
        </p>
        <Button type="button" onClick={() => setScheduleOpen(true)}>
          New SimplexLabs appointment
        </Button>
      </div>

      <AdminScheduleSimplexDialog companyId={companyId} open={scheduleOpen} onOpenChange={setScheduleOpen} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">Calendar</h2>
        <p className="text-xs text-text-secondary">
          Scoped to this company. Requires calendar API endpoints on the backend.
        </p>
        <CalendarView companyId={companyId} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">List</h2>
      </section>

      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">No appointments on file.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => {
            const needsCallback = appointmentNeedsCallback(a);
            return (
              <li key={a.id} className="rounded-lg border border-border-default bg-surface-page p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary">
                      {appointmentTypeLabel(a.type)} · {appointmentStatusLabel(a.status)}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">{formatDateTime(a.scheduledAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {needsCallback ? (
                      <Badge variant="warning" className="shrink-0">
                        Needs callback
                      </Badge>
                    ) : null}
                    {needsCallback ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={markCalled.isPending}
                        onClick={() => {
                          markCalled.mutate(a.id, {
                            onSuccess: () => notify.success('Marked as called'),
                            onError: (err) =>
                              notify.error(err instanceof Error ? err.message : 'Could not mark as called'),
                          });
                        }}
                      >
                        {markCalled.isPending ? 'Saving…' : 'Mark as called'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
