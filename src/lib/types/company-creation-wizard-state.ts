import type { CompanyBillingCycle } from '@/lib/types/admin-provisioning';
import { Niche, PlanFeatureType, type Channel } from '@/lib/types';
import type { PaymentMethod } from '@/lib/types/onboarding';

export type CompanyCreationStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface CompanyPlanDraftRow {
  planId: string;
  category: PlanFeatureType;
  billingCycle: CompanyBillingCycle;
  initialPayment: number;
  /** ISO date (yyyy-mm-dd) for subscription start. */
  startedAt: string;
}

export interface CompanyWizardState {
  step: CompanyCreationStep;
  info: {
    name: string;
    niche: Niche;
    phone: string;
    address: string;
    notificationPhone: string;
    notificationEmail: string;
  };
  /** Global billing cycle applied to new plan rows and the review payload. */
  billingCycle: CompanyBillingCycle;
  /** Up to one row per product category. */
  plans: CompanyPlanDraftRow[];
  agentConfig: {
    name: string;
    fallbackMessage: string;
    escalationMessage: string;
    channels: Channel[];
    paymentMethods: PaymentMethod[];
  } | null;
  whatsapp: {
    phoneNumberId: string;
    phoneNumber: string;
    apiKey: string;
    baseUrl: string;
    skip: boolean;
  };
  /** Optional website rows when a Website-category plan is selected. */
  websites: CompanyWizardWebsiteDraft[];
}

export interface CompanyWizardWebsiteDraft {
  url: string;
  label: string;
  isActive: boolean;
}

/** @deprecated Use {@link CompanyWizardState} */
export type CompanyCreationWizardState = CompanyWizardState;

export const COMPANY_WIZARD_STORAGE_KEY = 'simplex:admin:company-wizard:v2';

export function defaultPlanStartedAt(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createInitialCompanyWizardState(): CompanyWizardState {
  return {
    step: 1,
    info: {
      name: '',
      niche: Niche.GYM,
      phone: '',
      address: '',
      notificationPhone: '',
      notificationEmail: '',
    },
    billingCycle: 'MONTHLY',
    plans: [],
    agentConfig: null,
    whatsapp: {
      phoneNumberId: '',
      phoneNumber: '',
      apiKey: '',
      baseUrl: '',
      skip: true,
    },
    websites: [],
  };
}

/** @deprecated Use {@link createInitialCompanyWizardState} */
export const createInitialCompanyCreationState = createInitialCompanyWizardState;

export function getAgentsPlanId(state: CompanyWizardState): string | undefined {
  return state.plans.find((p) => p.category === PlanFeatureType.AGENTS)?.planId;
}

export function upsertPlanDraftRow(
  state: CompanyWizardState,
  category: PlanFeatureType,
  planId: string | undefined,
): CompanyWizardState {
  const without = state.plans.filter((p) => p.category !== category);
  if (!planId) {
    const nextPlans = without;
    const hasAgents = nextPlans.some((p) => p.category === PlanFeatureType.AGENTS);
    const hasWebsite = nextPlans.some((p) => p.category === PlanFeatureType.WEBSITE);
    return {
      ...state,
      plans: nextPlans,
      agentConfig: hasAgents ? state.agentConfig : null,
      websites: hasWebsite ? state.websites : [],
    };
  }
  const row: CompanyPlanDraftRow = {
    planId,
    category,
    billingCycle: state.billingCycle,
    initialPayment: 0,
    startedAt: defaultPlanStartedAt(),
  };
  const nextPlans = [...without, row];
  const hasAgents = nextPlans.some((p) => p.category === PlanFeatureType.AGENTS);
  return {
    ...state,
    plans: nextPlans,
    agentConfig: hasAgents
      ? state.agentConfig ?? {
          name: '',
          fallbackMessage: '',
          escalationMessage: '',
          channels: [],
          paymentMethods: [],
        }
      : null,
  };
}

export function setCompanyWizardBillingCycle(
  state: CompanyWizardState,
  billingCycle: CompanyBillingCycle,
): CompanyWizardState {
  return {
    ...state,
    billingCycle,
    plans: state.plans.map((p) => ({ ...p, billingCycle })),
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function reviveCompanyWizardState(raw: unknown): CompanyWizardState | null {
  if (!isRecord(raw)) return null;
  const base = createInitialCompanyWizardState();
  const maxStep = 6;
  const step =
    typeof raw.step === 'number' && raw.step >= 1 && raw.step <= maxStep
      ? (raw.step as CompanyCreationStep)
      : base.step;
  const info = isRecord(raw.info) ? raw.info : {};
  const plansRaw = Array.isArray(raw.plans) ? raw.plans : [];
  const plans: CompanyPlanDraftRow[] = plansRaw
    .filter(isRecord)
    .map((p) => {
      const cat = p.category;
      const billing = p.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
      const planId = typeof p.planId === 'string' ? p.planId : '';
      const initialPayment = typeof p.initialPayment === 'number' ? p.initialPayment : 0;
      const startedAt = typeof p.startedAt === 'string' ? p.startedAt : defaultPlanStartedAt();
      if (!Object.values(PlanFeatureType).includes(cat as PlanFeatureType)) return null;
      if (!planId) return null;
      return {
        planId,
        category: cat as PlanFeatureType,
        billingCycle: billing,
        initialPayment,
        startedAt,
      };
    })
    .filter((x): x is CompanyPlanDraftRow => x !== null);

  const agentRaw = raw.agentConfig;
  let agentConfig: CompanyWizardState['agentConfig'] = null;
  if (agentRaw === null) {
    agentConfig = null;
  } else if (isRecord(agentRaw)) {
    agentConfig = {
      name: typeof agentRaw.name === 'string' ? agentRaw.name : '',
      fallbackMessage: typeof agentRaw.fallbackMessage === 'string' ? agentRaw.fallbackMessage : '',
      escalationMessage: typeof agentRaw.escalationMessage === 'string' ? agentRaw.escalationMessage : '',
      channels: Array.isArray(agentRaw.channels) ? (agentRaw.channels as Channel[]) : [],
      paymentMethods: Array.isArray(agentRaw.paymentMethods) ? (agentRaw.paymentMethods as PaymentMethod[]) : [],
    };
  }

  const wa = isRecord(raw.whatsapp) ? raw.whatsapp : {};
  const phoneNumberId = typeof wa.phoneNumberId === 'string' ? wa.phoneNumberId : '';
  const phoneNumber = typeof wa.phoneNumber === 'string' ? wa.phoneNumber : '';

  const websitesRaw = Array.isArray(raw.websites) ? raw.websites : [];
  const websites: CompanyWizardWebsiteDraft[] = websitesRaw
    .filter(isRecord)
    .map((row) => ({
      url: typeof row.url === 'string' ? row.url : '',
      label: typeof row.label === 'string' ? row.label : '',
      isActive: typeof row.isActive === 'boolean' ? row.isActive : true,
    }));

  return {
    step,
    info: {
      name: typeof info.name === 'string' ? info.name : '',
      niche: Object.values(Niche).includes(info.niche as Niche) ? (info.niche as Niche) : Niche.GYM,
      phone: typeof info.phone === 'string' ? info.phone : '',
      address: typeof info.address === 'string' ? info.address : '',
      notificationPhone: typeof info.notificationPhone === 'string' ? info.notificationPhone : '',
      notificationEmail: typeof info.notificationEmail === 'string' ? info.notificationEmail : '',
    },
    billingCycle: raw.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
    plans,
    agentConfig: plans.some((p) => p.category === PlanFeatureType.AGENTS) ? agentConfig : null,
    whatsapp: {
      phoneNumberId,
      phoneNumber,
      apiKey: typeof wa.apiKey === 'string' ? wa.apiKey : '',
      baseUrl: typeof wa.baseUrl === 'string' ? wa.baseUrl : '',
      skip: typeof wa.skip === 'boolean' ? wa.skip : true,
    },
    websites,
  };
}

export function serializeCompanyWizardState(state: CompanyWizardState): unknown {
  return { v: 2, ...state };
}
