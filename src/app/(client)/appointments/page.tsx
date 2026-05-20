'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { PageShell } from '@/components/layout/page-shell';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/lib/hooks/use-appointments';
import type { Appointment } from '@/lib/types';

const CalendarView = dynamic(
  () => import('@/components/calendar/calendar-view').then((m) => m.CalendarView),
  { ssr: false, loading: () => <LoadingSpinner /> },
);

type ViewMode = 'calendar' | 'list';

export default function AppointmentsPage(): JSX.Element {
  const [view, setView] = useState<ViewMode>('calendar');
  const appointmentsQuery = useAppointments();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (appointment: Appointment): void => {
    setSelected(appointment);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!selected || !appointmentsQuery.data) return;
    const next = appointmentsQuery.data.find((a) => a.id === selected.id);
    if (next) setSelected(next);
  }, [appointmentsQuery.data, selected]);

  return (
    <PageShell
      title="Appointments"
      description="Manage your schedule and meetings. Calendar uses your profile timezone when set."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === 'calendar' ? 'default' : 'outline'}
          onClick={() => setView('calendar')}
        >
          Calendar
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          List
        </Button>
      </div>

      {view === 'calendar' ? (
        <CalendarView />
      ) : appointmentsQuery.isLoading ? (
        <SkeletonTable />
      ) : appointmentsQuery.isError ? (
        <div className="rounded-lg border border-error bg-error-light p-4 text-sm text-error-dark">
          Could not load appointments.
        </div>
      ) : (
        <AppointmentList appointments={appointmentsQuery.data ?? []} onRowClick={handleRowClick} />
      )}

      <AppointmentDetailModal appointment={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </PageShell>
  );
}
