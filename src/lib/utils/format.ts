import type {
  AppointmentStatus,
  AppointmentType,
  Channel,
  ContactSource,
  ConvoStatus,
  Niche,
  OrderStatus,
  PlanFeatureType,
  ProductType,
  Role,
  SubStatus,
} from '@/lib/types';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

export function formatDate(value: string | Date, locale: string = DEFAULT_LOCALE): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | Date, locale: string = DEFAULT_LOCALE): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatRelative(value: string | Date, locale: string = DEFAULT_LOCALE): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  SIMPLEX_WITH_CLIENT: 'Simplex ↔ client',
  CLIENT_WITH_CONTACT: 'Client ↔ contact',
  EXTERNAL: 'External',
};

const CONVO_STATUS_LABELS: Record<ConvoStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  PENDING: 'Pending',
};

const CHANNEL_LABELS: Record<Channel, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  MESSENGER: 'Messenger',
};

const CONTACT_SOURCE_LABELS: Record<ContactSource, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  MESSENGER: 'Messenger',
  MANUAL: 'Manual',
};

const SUB_STATUS_LABELS: Record<SubStatus, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
};

const NICHE_LABELS: Record<Niche, string> = {
  GYM: 'Gym',
  MEDICAL: 'Medical',
  ENTREPRENEUR: 'Entrepreneur',
};

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Admin',
  CLIENT: 'Client',
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  PRODUCT: 'Product',
  SERVICE: 'Service',
};

const PLAN_FEATURE_LABELS: Record<PlanFeatureType, string> = {
  WEBSITE: 'Website',
  MARKETING: 'Marketing',
  AGENTS: 'AI agents',
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status];
}

export function appointmentTypeLabel(type: AppointmentType): string {
  return APPOINTMENT_TYPE_LABELS[type];
}

export function convoStatusLabel(status: ConvoStatus): string {
  return CONVO_STATUS_LABELS[status];
}

export function channelLabel(channel: Channel): string {
  return CHANNEL_LABELS[channel];
}

export function contactSourceLabel(source: ContactSource): string {
  return CONTACT_SOURCE_LABELS[source];
}

export function subStatusLabel(status: SubStatus): string {
  return SUB_STATUS_LABELS[status];
}

export function nicheLabel(niche: Niche): string {
  return NICHE_LABELS[niche];
}

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export function productTypeLabel(type: ProductType): string {
  return PRODUCT_TYPE_LABELS[type];
}

export function planFeatureLabel(feature: PlanFeatureType): string {
  return PLAN_FEATURE_LABELS[feature];
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim();
}
