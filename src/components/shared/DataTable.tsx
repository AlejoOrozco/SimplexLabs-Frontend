'use client';

import { type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';

export interface DataTableColumn<TRow> {
  id: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  className?: string;
}

interface DataTableProps<TRow> {
  columns: readonly DataTableColumn<TRow>[];
  data: readonly TRow[];
  getRowId: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TRow>({
  columns,
  data,
  getRowId,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
}: DataTableProps<TRow>): JSX.Element {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.id} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={getRowId(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={onRowClick ? 'cursor-pointer' : undefined}
          >
            {columns.map((col) => (
              <TableCell key={col.id} className={col.className}>
                {col.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
