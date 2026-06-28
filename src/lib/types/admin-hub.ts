import type { Channel, Niche, Plan, SessionRoleName, SubStatus, Subscription, Website } from '@/lib/types';
import type { CompanyBillingCycle } from '@/lib/types/admin-provisioning';

/** Setup gap codes from `GET /admin/companies/:id/manage-summary`. */
export const AdminSetupGapCode = {
  NO_WEBSITE_PLAN: 'NO_WEBSITE_PLAN',
  NO_MARKETING_PLAN: 'NO_MARKETING_PLAN',
  NO_AGENTS_PLAN: 'NO_AGENTS_PLAN',
  NO_PRIMARY_USER: 'NO_PRIMARY_USER',
  NO_WEBSITE: 'NO_WEBSITE',
  NO_AGENT_CONFIG: 'NO_AGENT_CONFIG',
} as const;

export type AdminSetupGapCode = (typeof AdminSetupGapCode)[keyof typeof AdminSetupGapCode];

/** Plan product line as returned by admin subscription/plan APIs. */
export const AdminPlanCategory = {
  WEBSITE: 'WEBSITE',
  MARKETING: 'MARKETING',
  AI_AGENTS: 'AI_AGENTS',
} as const;

export type AdminPlanCategory = (typeof AdminPlanCategory)[keyof typeof AdminPlanCategory];

export const AdminPlanTier = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type AdminPlanTier = (typeof AdminPlanTier)[keyof typeof AdminPlanTier];

export interface AdminManageSummaryCompany {
  id: string;
  name: string;
  niche: Niche;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  isPlatformOwner: boolean;
  createdAt: string;
  notificationEmail: string | null;
  notificationPhone: string | null;
}

export interface AdminManageSummarySubscription {
  id: string;
  status: SubStatus;
  billingCycle: CompanyBillingCycle;
  startedAt: string;
  nextBillingAt: string | null;
  initialPayment: number | null;
  plan: {
    id: string;
    name: string;
    category: AdminPlanCategory | null;
    priceMonthly: number;
    priceAnnual: number | null;
  } | null;
}

export interface AdminManageSummaryUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: SessionRoleName;
  isActive: boolean;
}

export interface AdminManageSummaryAgentConfig {
  id: string;
  name: string;
  channels: Channel[];
  fallbackMessage: string;
  escalationMessage: string;
  isActive: boolean;
}

export interface AdminManageSummary {
  company: AdminManageSummaryCompany;
  subscriptions: AdminManageSummarySubscription[];
  websites: {
    count: number;
    items: Pick<Website, 'id' | 'url' | 'label' | 'isActive'>[];
  };
  users: {
    count: number;
    primaryAdmin: AdminManageSummaryUser | null;
    items: AdminManageSummaryUser[];
  };
  agentConfig: AdminManageSummaryAgentConfig | null;
  knowledgeBase: {
    entryCount: number;
    activeCount: number;
  };
  setupGaps: AdminSetupGapCode[];
}

export interface AdminBillingRecordSummary {
  id: string;
  amount: string;
  paidAt: string;
  isSetupFee: boolean;
  subscriptionId: string;
}

/** Extended subscription row from admin company subscriptions list. */
export interface AdminCompanySubscription extends Subscription {
  billingCycle?: CompanyBillingCycle;
  pendingPlan?: Plan | null;
  billingRecords?: AdminBillingRecordSummary[];
}

export interface AdminAssignSubscriptionDto {
  planId: string;
  billingCycle: CompanyBillingCycle;
  status?: SubStatus;
  initialPayment?: number | null;
  startedAt: string;
  nextBillingAt?: string | null;
  replaceExisting?: boolean;
}

export interface AdminUpdateSubscriptionDto {
  status?: SubStatus;
  billingCycle?: CompanyBillingCycle;
  initialPayment?: number | null;
  startedAt?: string;
  nextBillingAt?: string | null;
}

export interface AdminSwapSubscriptionPlanDto {
  planId: string;
  billingCycle?: CompanyBillingCycle;
  initialPayment?: number | null;
  effectiveAt?: string;
}

export interface AdminCancelSubscriptionDto {
  reason?: string;
}

export interface AdminPlanListFilters {
  niche?: Niche;
  category?: AdminPlanCategory;
  tier?: AdminPlanTier;
  activeOnly?: boolean;
}

/** Admin plan catalog row (includes inactive plans and admin-only fields). */
export type AdminPlan = Omit<Plan, 'category'> & {
  category: AdminPlanCategory | null;
  tier?: AdminPlanTier | null;
  maxCampaigns?: number | null;
};

export interface AdminWritePlanDto {
  name: string;
  niche: Niche;
  category: AdminPlanCategory;
  tier?: AdminPlanTier;
  priceMonthly: number;
  priceAnnual?: number | null;
  setupFee: number;
  maxCampaigns?: number | null;
  description?: string | null;
  features?: AdminPlanCategory[];
  channels?: Channel[];
}

export type AdminUpdatePlanDto = Partial<AdminWritePlanDto>;

export interface AdminUpdatePlanStatusDto {
  isActive: boolean;
}

export interface AdminUpdateCompanyProfileDto {
  name?: string;
  niche?: Niche;
  phone?: string | null;
  address?: string | null;
  notificationEmail?: string | null;
  notificationPhone?: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappPhoneNumber?: string | null;
}

export interface AdminCompanyHubUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: SessionRoleName;
  isActive: boolean;
  firstLoginCompleted: boolean;
}

export interface AdminAgentConfig {
  id: string;
  companyId: string;
  name: string;
  fallbackMessage: string;
  escalationMessage: string;
  channels: Channel[];
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUpdateAgentConfigDto {
  name?: string;
  fallbackMessage?: string;
  escalationMessage?: string;
  channels?: Channel[];
  language?: string;
}

export interface AgentKbEntry {
  id: string;
  companyId: string;
  title: string;
  content: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentKbListFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AgentKbListResponse {
  items: AgentKbEntry[];
  total: number;
}

export interface AgentKbWriteDto {
  title: string;
  content: string;
  category?: string | null;
  isActive?: boolean;
}

export type AgentKbUpdateDto = Partial<AgentKbWriteDto>;

export interface AdminBillingSubscriptionLine {
  id: string;
  status: SubStatus;
  category: AdminPlanCategory | null;
  billingCycle: CompanyBillingCycle;
  planName: string;
  amount: number;
  nextBillingAt: string | null;
}

export interface AdminCompanyBillingOverview {
  mrr: number;
  nextChargeAt: string | null;
  subscriptions: AdminBillingSubscriptionLine[];
  recentPayments: AdminBillingRecordSummary[];
}

export interface RecordManualPaymentDto {
  paidAt: string;
  paymentMethod: string;
  amount?: number;
  billingRecordId?: string;
  notes?: string;
}
