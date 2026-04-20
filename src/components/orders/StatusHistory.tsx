'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import type { OrderStatusHistory as HistoryEntry } from '@/lib/types';
import { formatDateTime, fullName } from '@/lib/utils/format';

interface StatusHistoryProps {
  history: readonly HistoryEntry[];
}

export function StatusHistory({ history }: StatusHistoryProps): JSX.Element {
  if (history.length === 0) {
    return <EmptyState title="No status changes yet" />;
  }

  return (
    <ol className="flex flex-col gap-3 border-l pl-4">
      {history.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[21px] top-1.5 block h-2.5 w-2.5 rounded-full border bg-white" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {entry.prevStatus ? (
              <>
                <OrderStatusBadge status={entry.prevStatus} />
                <span className="text-gray-500">→</span>
              </>
            ) : null}
            <OrderStatusBadge status={entry.newStatus} />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {formatDateTime(entry.createdAt)}
            {entry.changedBy ? <> · {fullName(entry.changedBy)}</> : null}
          </p>
          {entry.reason ? (
            <p className="mt-1 text-sm text-gray-700">{entry.reason}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
