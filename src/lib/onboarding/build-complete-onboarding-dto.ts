import type { OnboardingWizardState } from '@/lib/types/onboarding';

/** Payload aligned with the expected admin onboarding API contract. */
export interface CompleteOnboardingDto {
  company: OnboardingWizardState['company'];
  credentials: OnboardingWizardState['credentials'];
  plan: OnboardingWizardState['plan'];
  agent: OnboardingWizardState['agent'];
  whatsapp: OnboardingWizardState['whatsapp'];
}

export function buildCompleteOnboardingDto(state: OnboardingWizardState): CompleteOnboardingDto {
  return {
    company: state.company,
    credentials: state.credentials,
    plan: state.plan,
    agent: state.agent,
    whatsapp: state.whatsapp,
  };
}
