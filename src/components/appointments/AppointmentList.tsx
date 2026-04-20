'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Appointment } from '@/lib/types';
import { appointmentTypeLabel, formatDateTime, fullName } from '@/lib/utils/format';

interface AppointmentListProps {
  appointments: readonly Appointment[];
  onRowClick?: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  onRowClick,
}: AppointmentListProps): JSX.Element {
  const columns: readonly DataTableColumn<Appointment>[] = [
    {
      id: 'title',
      header: 'Title',
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    { id: 'type', header: 'Type', cell: (row) => appointmentTypeLabel(row.type) },
    {
      id: 'scheduledAt',
      header: 'Scheduled',
      cell: (row) => formatDateTime(row.scheduledAt),
    },
    {
      id: 'attendee',
      header: 'Attendee',
      cell: (row) =>
        row.contact
          ? fullName(row.contact)
          : row.externalAttendeeName ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="appointment" status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={appointments}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No appointments"
      emptyDescription="Create your first appointment to see it here."
    />
  );
}
