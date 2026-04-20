import { StatusBadge } from '@/components/shared/StatusBadge';
import type { OrderStatus } from '@/lib/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps): JSX.Element {
  return <StatusBadge kind="order" status={status} className={className} />;
}
