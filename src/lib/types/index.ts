export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENT: 'CLIENT',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Niche = {
  GYM: 'GYM',
  MEDICAL: 'MEDICAL',
  ENTREPRENEUR: 'ENTREPRENEUR',
} as const;
export type Niche = (typeof Niche)[keyof typeof Niche];

export const PlanFeatureType = {
  WEBSITE: 'WEBSITE',
  MARKETING: 'MARKETING',
  AGENTS: 'AGENTS',
} as const;
export type PlanFeatureType = (typeof PlanFeatureType)[keyof typeof PlanFeatureType];

export const Channel = {
  WHATSAPP: 'WHATSAPP',
  INSTAGRAM: 'INSTAGRAM',
  MESSENGER: 'MESSENGER',
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel];

export const SubStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
} as const;
export type SubStatus = (typeof SubStatus)[keyof typeof SubStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const AppointmentType = {
  SIMPLEX_WITH_CLIENT: 'SIMPLEX_WITH_CLIENT',
  CLIENT_WITH_CONTACT: 'CLIENT_WITH_CONTACT',
  EXTERNAL: 'EXTERNAL',
} as const;
export type AppointmentType = (typeof AppointmentType)[keyof typeof AppointmentType];

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const ConvoStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING',
} as const;
export type ConvoStatus = (typeof ConvoStatus)[keyof typeof ConvoStatus];

export const SenderType = {
  AGENT: 'AGENT',
  CONTACT: 'CONTACT',
} as const;
export type SenderType = (typeof SenderType)[keyof typeof SenderType];

export const ProductType = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const ContactSource = {
  WHATSAPP: 'WHATSAPP',
  INSTAGRAM: 'INSTAGRAM',
  MESSENGER: 'MESSENGER',
  MANUAL: 'MANUAL',
} as const;
export type ContactSource = (typeof ContactSource)[keyof typeof ContactSource];

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: string | null;
}

export interface Company {
  id: string;
  name: string;
  niche: Niche;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: string;
  planId: string;
  feature: PlanFeatureType;
  createdAt: string;
  updatedAt: string;
}

export interface PlanChannel {
  id: string;
  planId: string;
  channel: Channel;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  niche: Niche;
  priceMonthly: number;
  setupFee: number;
  isActive: boolean;
  features: PlanFeature[];
  channels: PlanChannel[];
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubStatus;
  initialPayment: number | null;
  startedAt: string;
  nextBillingAt: string | null;
  plan?: Plan;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  source: ContactSource;
  createdAt: string;
  updatedAt: string;
}

export interface Website {
  id: string;
  companyId: string;
  url: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  type: ProductType;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  changedById: string;
  prevStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string | null;
  createdAt: string;
  changedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface Order {
  id: string;
  companyId: string;
  contactId: string;
  productId: string;
  status: OrderStatus;
  amount: number;
  notes: string | null;
  contact?: Pick<ClientContact, 'id' | 'firstName' | 'lastName' | 'email'>;
  product?: Pick<Product, 'id' | 'name' | 'type' | 'price'>;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  companyId: string;
  organizerId: string;
  contactId: string | null;
  productId: string | null;
  title: string;
  description: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string | null;
  externalAttendeeName: string | null;
  externalAttendeeEmail: string | null;
  organizer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  contact?: Pick<ClientContact, 'id' | 'firstName' | 'lastName' | 'email'>;
  product?: Pick<Product, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  content: string;
  metadata: Record<string, unknown> | null;
  sentAt: string;
  deliveredAt: string | null;
}

export interface Conversation {
  id: string;
  companyId: string;
  contactId: string;
  channel: Channel;
  status: ConvoStatus;
  contact?: Pick<ClientContact, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  lastMessage?: Pick<Message, 'id' | 'content' | 'senderType' | 'sentAt'>;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
} as const;
