import { Niche } from '@/lib/types';
import type { OnboardingWizardState } from '@/lib/types/onboarding';

export function createInitialOnboardingWizardState(): OnboardingWizardState {
  const startedAt = new Date().toISOString().slice(0, 10);
  return {
    step: 1,
    company: {
      mode: 'new',
      name: '',
      niche: Niche.GYM,
      phone: '',
      address: '',
      notificationPhone: '',
      notificationEmail: '',
    },
    credentials: {
      email: '',
      firstName: '',
      lastName: '',
      generatedPassword: '',
    },
    plan: {
      planId: '',
      initialPayment: 0,
      startedAt,
      nextBillingAt: undefined,
    },
    agent: {
      agentName: '',
      fallbackMessage: '',
      escalationMessage: '',
      channels: [],
      paymentMethods: [],
    },
    whatsapp: {
      skip: false,
    },
  };
}
