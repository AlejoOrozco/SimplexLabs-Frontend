'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { Company } from '@/lib/types';
import { formatDate, nicheLabel } from '@/lib/utils/format';

interface CompanyListProps {
  companies: readonly Company[];
  onRowClick?: (company: Company) => void;
}

export function CompanyList({ companies, onRowClick }: CompanyListProps): JSX.Element {
  const columns: readonly DataTableColumn<Company>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { id: 'niche', header: 'Niche', cell: (row) => nicheLabel(row.niche) },
    { id: 'phone', header: 'Phone', cell: (row) => row.phone ?? '—' },
    { id: 'createdAt', header: 'Created', cell: (row) => formatDate(row.createdAt) },
  ];

  return (
    <DataTable
      columns={columns}
      data={companies}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No companies"
    />
  );
}
