import type { Channel, Niche } from '@/lib/types';

/** Result shown on the credentials confirmation screen after admin user creation. */
export interface AdminCreateUserResult {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export type UserCreationMode = 'client' | 'staff';

export type CompanyBillingCycle = 'MONTHLY' | 'ANNUAL';

/** POST /admin/users/create-client — server generates password and assigns COMPANY_ADMIN. */
export interface AdminCreateClientUserDto {
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** POST /admin/users/create-staff — server generates credentials; role chosen via roleName. */
export interface AdminCreateStaffUserDto {
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: 'COMPANY_ADMIN' | 'COMPANY_STAFF';
  /** Applied when roleName is COMPANY_STAFF. */
  permissionUpdates?: Array<{ permissionKey: string; isGranted: boolean }>;
}

export type AdminCreateUserVariables =
  | { readonly flow: 'client'; readonly dto: AdminCreateClientUserDto }
  | { readonly flow: 'staff'; readonly dto: AdminCreateStaffUserDto };

/** Backend enum for `agentConfig.paymentMethods` on POST /admin/companies/create-full. */
export const AdminCompanyAgentPaymentMethod = {
  STRIPE: 'STRIPE',
  WIRE_TRANSFER: 'WIRE_TRANSFER',
} as const;
export type AdminCompanyAgentPaymentMethod =
  (typeof AdminCompanyAgentPaymentMethod)[keyof typeof AdminCompanyAgentPaymentMethod];

/** Plan row for POST /admin/companies/create-full (flat DTO `plans` array). */
export interface AdminCreateCompanyPlanDto {
  planId: string;
  billingCycle: CompanyBillingCycle;
  initialPayment: number;
  startedAt: string;
}

/** Agent block for POST /admin/companies/create-full (flat DTO `agentConfig`). */
export interface AdminCreateCompanyAgentConfigDto {
  name: string;
  fallbackMessage: string;
  escalationMessage: string;
  channels: Channel[];
  paymentMethods: AdminCompanyAgentPaymentMethod[];
}

/**
 * Flat request body for POST /admin/companies/create-full (matches backend DTO).
 * WhatsApp numbers live at the root; `agentConfig` is only sent when an AI_AGENTS plan is selected.
 */
export interface AdminCreateCompanyDto {
  name: string;
  niche: Niche;
  phone?: string;
  address?: string;
  notificationPhone?: string;
  notificationEmail?: string;
  whatsappPhoneNumberId?: string;
  whatsappPhoneNumber?: string;
  dialogApiKey?: string;
  dialogBaseUrl?: string;
  plans: AdminCreateCompanyPlanDto[];
  agentConfig?: AdminCreateCompanyAgentConfigDto;
}

export interface AdminCreateCompanyResult {
  companyId: string;
  companyName: string;
  activatedPlanNames: string[];
}
