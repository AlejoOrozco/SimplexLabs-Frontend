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

/** Client confirmation for SimplexLabs-scheduled meetings (separate from workflow `status`). */
export const AppointmentConfirmationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED',
} as const;
export type AppointmentConfirmationStatus =
  (typeof AppointmentConfirmationStatus)[keyof typeof AppointmentConfirmationStatus];

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

/** Values returned on `/auth/me` and login payloads (`roleName`). */
export type SessionRoleName =
  | 'SUPER_ADMIN'
  | 'SIMPLEX_STAFF'
  | 'COMPANY_ADMIN'
  | 'COMPANY_STAFF'
  | 'CLIENT';

export interface AuthSessionCompany {
  id: string;
  name: string;
  niche: string;
  isPlatformOwner: boolean;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: SessionRoleName;
  isOwner: boolean;
  companyId: string | null;
  permissions: string[];
  company: AuthSessionCompany | null;
  /** IANA timezone (e.g. America/Bogota). */
  timezone: string;
  firstLoginCompleted: boolean;
}

export interface AttendeeSearchResult {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  group: string;
  roleName: string | null;
}

export interface ManagedPermissionRow {
  key: string;
  label: string;
  description: string;
  isGranted: boolean;
  isOverridden: boolean;
  roleDefault: boolean;
}

export type UserPermissionsManagementMap = Record<string, ManagedPermissionRow[]>;

export interface Company {
  id: string;
  name: string;
  niche: Niche;
  phone: string | null;
  address: string | null;
  deactivatedAt?: string | null;
  deactivationReason?: string | null;
  notificationPhone?: string | null;
  notificationEmail?: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappPhoneNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on some admin list payloads so the UI can show the primary admin without an extra fetch. */
  users?: User[];
}

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SessionRoleName;
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
  /**
   * Product line for catalog grouping (Website / Marketing / Agents). When the API sends this
   * (e.g. from a `plans.category` column), the onboarding picker prefers it over inferring from
   * {@link PlanFeature} rows — see `primaryPlanCategory` in `group-plans-for-onboarding.ts`.
   */
  category?: PlanFeatureType | null;
  priceMonthly: number;
  /** When set, annual billing uses this amount; otherwise UI may derive 12× monthly. */
  priceAnnual?: number | null;
  setupFee: number;
  isActive: boolean;
  features: PlanFeature[];
  channels: PlanChannel[];
  /** Short marketing copy for admin plan picker cards. */
  description?: string | null;
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

/** Result of probing whether a website URL responds (from `POST /websites/:id/check-live`). */
export interface WebsiteLiveStatus {
  isLive: boolean;
  responseTimeMs: number;
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
  /** Client acceptance of a SimplexLabs ↔ client meeting; omitted means pending for legacy payloads. */
  confirmationStatus?: AppointmentConfirmationStatus;
  /** Client requested phone callback instead of confirming the proposed slot. */
  callMeAsap?: boolean;
  /** When set, an admin cleared the callback request after contacting the client. */
  callbackHandledAt?: string | null;
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
