'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrderHistory } from '@/lib/api/orders.api';
import { orderStatusLabel } from '@/lib/utils/format';

interface OrderHistoryPanelProps {
  orderId: string;
}

export function OrderHistoryPanel({ orderId }: OrderHistoryPanelProps): JSX.Element {
  const query = useQuery({
    queryKey: ['orders', 'history', orderId],
    queryFn: () => getOrderHistory(orderId),
  });

  if (query.isLoading) {
    return <p className="text-xs text-text-secondary">Loading history…</p>;
  }
  if (query.isError) {
    return <p className="text-xs text-error">Could not load status history.</p>;
  }

  const items = query.data ?? [];
  if (items.length === 0) {
    return <p className="text-xs text-text-secondary">No status changes recorded.</p>;
  }

  return (
    <ol className="mt-2 space-y-1 border-l border-border-default pl-3 text-xs">
      {items.map((h) => (
        <li key={h.id} className="text-text-secondary">
          <span className="font-medium text-text-primary">{orderStatusLabel(h.newStatus)}</span>
          {h.prevStatus ? (
            <span> from {orderStatusLabel(h.prevStatus)}</span>
          ) : null}
          <span className="block text-text-secondary">{new Date(h.createdAt).toLocaleString()}</span>
          {h.reason ? <span className="block italic">{h.reason}</span> : null}
        </li>
      ))}
    </ol>
  );
}
