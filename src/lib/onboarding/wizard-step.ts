import type { OnboardingWizardState } from '@/lib/types/onboarding';

const ORDER = [1, 2, 3, 4, 5, 6] as const satisfies readonly OnboardingWizardState['step'][];

function stepAt(index: number): OnboardingWizardState['step'] {
  const value = ORDER[index];
  if (value === undefined) {
    return ORDER[0];
  }
  return value;
}

export function nextWizardStep(step: OnboardingWizardState['step']): OnboardingWizardState['step'] {
  const index = ORDER.indexOf(step);
  return stepAt(Math.min(index + 1, ORDER.length - 1));
}

export function previousWizardStep(step: OnboardingWizardState['step']): OnboardingWizardState['step'] {
  const index = ORDER.indexOf(step);
  return stepAt(Math.max(index - 1, 0));
}
