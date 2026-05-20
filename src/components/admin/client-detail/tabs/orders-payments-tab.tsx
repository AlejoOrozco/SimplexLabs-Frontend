'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { OrderHistoryPanel } from '@/components/admin/client-detail/order-history-panel';
import { getPayments } from '@/lib/api/payments.api';
import { useOrders } from '@/lib/hooks/use-orders';
import { formatCurrency, formatDateTime, orderStatusLabel } from '@/lib/utils/format';

interface OrdersPaymentsTabProps {
  companyId: string;
}

export function OrdersPaymentsTab({ companyId }: OrdersPaymentsTabProps): JSX.Element {
  const ordersQuery = useOrders();
  const paymentsQuery = useQuery({
    queryKey: ['admin', 'company', companyId, 'payments'],
    queryFn: () => getPayments(),
  });
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const orders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    return list.filter((o) => o.companyId === companyId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [ordersQuery.data, companyId]);

  const payments = useMemo(() => {
    const list = paymentsQuery.data ?? [];
    return list.filter((p) => {
      const row = p as { companyId?: string };
      if (row.companyId === undefined) return true;
      return row.companyId === companyId;
    });
  }, [paymentsQuery.data, companyId]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold text-text-primary">Orders</h3>
        <p className="text-xs text-text-secondary">Status history is loaded per order when expanded.</p>
        {ordersQuery.isLoading ? (
          <p className="mt-2 text-sm text-text-secondary">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No orders for this company.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {orders.map((order) => {
              const expanded = openOrderId === order.id;
              return (
                <li key={order.id} className="rounded-lg border border-border-default bg-surface-page p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{order.product?.name ?? 'Product'}</p>
                      <p className="text-xs text-text-secondary">
                        {orderStatusLabel(order.status)} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatCurrency(order.amount)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-auto px-2 py-0 text-xs"
                        onClick={() => setOpenOrderId(expanded ? null : order.id)}
                      >
                        {expanded ? 'Hide history' : 'Status history'}
                      </Button>
                    </div>
                  </div>
                  {expanded ? <OrderHistoryPanel orderId={order.id} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-text-primary">Payments</h3>
        <p className="text-xs text-text-secondary">
          Platform payment feed (rows include a company id when the API exposes it; otherwise all rows are shown).
        </p>
        {paymentsQuery.isLoading ? (
          <p className="mt-2 text-sm text-text-secondary">Loading payments…</p>
        ) : paymentsQuery.isError ? (
          <p className="mt-2 text-sm text-error">Could not load payments.</p>
        ) : payments.length === 0 ? (
          <p className="mt-2 text-sm text-text-secondary">No payments returned for this filter.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-lg border border-border-default bg-surface-page p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-text-primary">{p.status}</span>
                  <span className="tabular-nums">{formatCurrency(p.amount)}</span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {p.method} · {formatDateTime(p.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
