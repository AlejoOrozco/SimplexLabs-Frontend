import { Badge, type BadgeProps } from '@/components/ui/badge';
import type {
  AppointmentStatus,
  ConvoStatus,
  OrderStatus,
  SubStatus,
} from '@/lib/types';
import {
  appointmentStatusLabel,
  convoStatusLabel,
  orderStatusLabel,
  subStatusLabel,
} from '@/lib/utils/format';

type StatusKind = 'order' | 'appointment' | 'conversation' | 'subscription';

interface StatusBadgeProps {
  kind: StatusKind;
  status: string;
  className?: string;
}

type Variant = NonNullable<BadgeProps['variant']>;

const ORDER_VARIANTS: Record<OrderStatus, Variant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const APPOINTMENT_VARIANTS: Record<AppointmentStatus, Variant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const CONVO_VARIANTS: Record<ConvoStatus, Variant> = {
  OPEN: 'success',
  PENDING: 'warning',
  CLOSED: 'neutral',
};

const SUB_VARIANTS: Record<SubStatus, Variant> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  CANCELLED: 'destructive',
};

function resolve(kind: StatusKind, status: string): { label: string; variant: Variant } {
  switch (kind) {
    case 'order': {
      const s = status as OrderStatus;
      return { label: orderStatusLabel(s), variant: ORDER_VARIANTS[s] ?? 'default' };
    }
    case 'appointment': {
      const s = status as AppointmentStatus;
      return {
        label: appointmentStatusLabel(s),
        variant: APPOINTMENT_VARIANTS[s] ?? 'default',
      };
    }
    case 'conversation': {
      const s = status as ConvoStatus;
      return { label: convoStatusLabel(s), variant: CONVO_VARIANTS[s] ?? 'default' };
    }
    case 'subscription': {
      const s = status as SubStatus;
      return { label: subStatusLabel(s), variant: SUB_VARIANTS[s] ?? 'default' };
    }
    default:
      return { label: status, variant: 'default' };
  }
}

export function StatusBadge({ kind, status, className }: StatusBadgeProps): JSX.Element {
  const { label, variant } = resolve(kind, status);
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
