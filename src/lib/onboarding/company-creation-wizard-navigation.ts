import { PlanFeatureType } from '@/lib/types';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';

type CompanyStep = CompanyWizardState['step'];

export type CompanyCreationScreen = 'info' | 'plans' | 'agent' | 'whatsapp' | 'websites' | 'review';

export function companyHasAgentsPlan(state: CompanyWizardState): boolean {
  return state.plans.some((p) => p.category === PlanFeatureType.AGENTS);
}

export function companyHasWebsitePlan(state: CompanyWizardState): boolean {
  return state.plans.some((p) => p.category === PlanFeatureType.WEBSITE);
}

export function companyCreationPhysicalStepCount(state: CompanyWizardState): number {
  const hasAgent = companyHasAgentsPlan(state);
  const hasWebsite = companyHasWebsitePlan(state);
  const base = hasAgent ? 5 : 4;
  return hasWebsite ? base + 1 : base;
}

export function getCompanyCreationScreen(state: CompanyWizardState): CompanyCreationScreen {
  const { step } = state;
  const hasAgent = companyHasAgentsPlan(state);
  const hasWebsite = companyHasWebsitePlan(state);

  if (step <= 1) return 'info';
  if (step === 2) return 'plans';

  if (hasAgent) {
    if (step === 3) return 'agent';
    if (step === 4) return 'whatsapp';
    if (hasWebsite) {
      if (step === 5) return 'websites';
      return 'review';
    }
    if (step === 5) return 'review';
    return 'review';
  }

  if (step === 3) return 'whatsapp';
  if (hasWebsite) {
    if (step === 4) return 'websites';
    return 'review';
  }
  if (step === 4) return 'review';
  return 'review';
}

export function goNextCompanyCreationStep(state: CompanyWizardState): CompanyWizardState {
  const max = companyCreationPhysicalStepCount(state);
  const next = Math.min(state.step + 1, max);
  return { ...state, step: next as CompanyStep };
}

export function goPrevCompanyCreationStep(state: CompanyWizardState): CompanyWizardState {
  return { ...state, step: Math.max(1, state.step - 1) as CompanyStep };
}

export function companyCreationStepLabels(state: CompanyWizardState): { number: number; label: string }[] {
  const hasAgent = companyHasAgentsPlan(state);
  const hasWebsite = companyHasWebsitePlan(state);

  if (hasAgent && hasWebsite) {
    return [
      { number: 1, label: 'Company' },
      { number: 2, label: 'Plans' },
      { number: 3, label: 'Agent' },
      { number: 4, label: 'WhatsApp' },
      { number: 5, label: 'Websites' },
      { number: 6, label: 'Review' },
    ];
  }
  if (hasAgent) {
    return [
      { number: 1, label: 'Company' },
      { number: 2, label: 'Plans' },
      { number: 3, label: 'Agent' },
      { number: 4, label: 'WhatsApp' },
      { number: 5, label: 'Review' },
    ];
  }
  if (hasWebsite) {
    return [
      { number: 1, label: 'Company' },
      { number: 2, label: 'Plans' },
      { number: 3, label: 'WhatsApp' },
      { number: 4, label: 'Websites' },
      { number: 5, label: 'Review' },
    ];
  }
  return [
    { number: 1, label: 'Company' },
    { number: 2, label: 'Plans' },
    { number: 3, label: 'WhatsApp' },
    { number: 4, label: 'Review' },
  ];
}
