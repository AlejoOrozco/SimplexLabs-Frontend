'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import type { Plan } from '@/lib/types';
import {
  channelLabel,
  formatCurrency,
  nicheLabel,
  planFeatureLabel,
} from '@/lib/utils/format';

interface PlanListProps {
  plans: readonly Plan[];
  onRowClick?: (plan: Plan) => void;
}

export function PlanList({ plans, onRowClick }: PlanListProps): JSX.Element {
  const columns: readonly DataTableColumn<Plan>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { id: 'niche', header: 'Niche', cell: (row) => nicheLabel(row.niche) },
    {
      id: 'priceMonthly',
      header: 'Monthly',
      cell: (row) => formatCurrency(row.priceMonthly),
    },
    {
      id: 'features',
      header: 'Features',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.features.map((f) => (
            <Badge key={f.id} variant="info">
              {planFeatureLabel(f.feature)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'channels',
      header: 'Channels',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.channels.map((c) => (
            <Badge key={c.id} variant="neutral">
              {channelLabel(c.channel)}
            </Badge>
          ))}
        </div>
      ),
    },
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
      data={plans}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No plans"
    />
  );
}
