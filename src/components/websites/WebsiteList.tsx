'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { Website } from '@/lib/types';

interface WebsiteListProps {
  websites: readonly Website[];
  onRowClick?: (website: Website) => void;
}

export function WebsiteList({ websites, onRowClick }: WebsiteListProps): JSX.Element {
  const columns: readonly DataTableColumn<Website>[] = [
    {
      id: 'url',
      header: 'URL',
      cell: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.url}
        </a>
      ),
    },
    { id: 'label', header: 'Label', cell: (row) => row.label ?? '—' },
    {
      id: 'isActive',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={websites}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No websites"
    />
  );
}
