'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Subscription } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface SubscriptionListProps {
  subscriptions: readonly Subscription[];
  onRowClick?: (subscription: Subscription) => void;
}

export function SubscriptionList({
  subscriptions,
  onRowClick,
}: SubscriptionListProps): JSX.Element {
  const columns: readonly DataTableColumn<Subscription>[] = [
    {
      id: 'company',
      header: 'Company',
      cell: (row) => row.company?.name ?? row.companyId,
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: (row) =>
        row.plan ? `${row.plan.name} · ${formatCurrency(row.plan.priceMonthly)}/mo` : row.planId,
    },
    {
      id: 'startedAt',
      header: 'Started',
      cell: (row) => formatDate(row.startedAt),
    },
    {
      id: 'nextBillingAt',
      header: 'Next billing',
      cell: (row) => (row.nextBillingAt ? formatDate(row.nextBillingAt) : '—'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="subscription" status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={subscriptions}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No subscriptions"
    />
  );
}
