'use client';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderStatusSelect } from '@/components/orders/OrderStatusSelect';
import { StatusHistory } from '@/components/orders/StatusHistory';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOrderHistory, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import type { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDateTime, fullName } from '@/lib/utils/format';

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDialog({
  order,
  onClose,
}: OrderDetailDialogProps): JSX.Element {
  const history = useOrderHistory(order?.id);
  const updateStatus = useUpdateOrderStatus(order?.id ?? '');

  const handleUpdate = async (next: OrderStatus): Promise<void> => {
    await updateStatus.mutateAsync({ status: next });
  };

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order {order?.id.slice(0, 8)}</DialogTitle>
          {order ? (
            <DialogDescription>
              {formatDateTime(order.createdAt)} · {formatCurrency(order.amount)}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {order ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div>
                <span className="text-gray-600">Contact:</span>{' '}
                {order.contact ? fullName(order.contact) : order.contactId}
              </div>
              <div>
                <span className="text-gray-600">Product:</span>{' '}
                {order.product?.name ?? order.productId}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Status:</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <OrderStatusSelect current={order.status} onUpdate={handleUpdate} />

            <div>
              <h3 className="mb-2 text-sm font-semibold">History</h3>
              {history.isLoading ? (
                <LoadingSpinner />
              ) : history.isError ? (
                <p className="text-sm text-red-700">{history.error.message}</p>
              ) : (
                <StatusHistory history={history.data ?? []} />
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
