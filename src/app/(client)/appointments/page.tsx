'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { PageMeta } from '@/components/layout/page-meta';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SkeletonTable } from '@/components/shared/Skeleton';
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
    <>
      <PageMeta
        title="Appointments"
        description="Manage your schedule and meetings. Calendar uses your profile timezone when set."
      />
      <div className="calendar-view-selector mb-4" role="group" aria-label="Appointments layout">
        <button
          type="button"
          className={view === 'calendar' ? 'active' : undefined}
          aria-pressed={view === 'calendar'}
          onClick={() => setView('calendar')}
        >
          Calendar
        </button>
        <button
          type="button"
          className={view === 'list' ? 'active' : undefined}
          aria-pressed={view === 'list'}
          onClick={() => setView('list')}
        >
          List
        </button>
      </div>

      {view === 'calendar' ? (
        <CalendarView />
      ) : appointmentsQuery.isLoading ? (
        <SkeletonTable />
      ) : appointmentsQuery.isError ? (
        <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
          Could not load appointments.
        </div>
      ) : (
        <AppointmentList appointments={appointmentsQuery.data ?? []} onRowClick={handleRowClick} />
      )}

      <AppointmentDetailModal appointment={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
