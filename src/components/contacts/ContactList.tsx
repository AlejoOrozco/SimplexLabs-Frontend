'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { ClientContact } from '@/lib/types';
import { contactSourceLabel, formatDate, fullName } from '@/lib/utils/format';

interface ContactListProps {
  contacts: readonly ClientContact[];
  onRowClick?: (contact: ClientContact) => void;
}

export function ContactList({ contacts, onRowClick }: ContactListProps): JSX.Element {
  const columns: readonly DataTableColumn<ClientContact>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{fullName(row)}</span>,
    },
    { id: 'email', header: 'Email', cell: (row) => row.email ?? '—' },
    { id: 'phone', header: 'Phone', cell: (row) => row.phone ?? '—' },
    { id: 'source', header: 'Source', cell: (row) => contactSourceLabel(row.source) },
    { id: 'createdAt', header: 'Created', cell: (row) => formatDate(row.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      data={contacts}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No contacts yet"
    />
  );
}
