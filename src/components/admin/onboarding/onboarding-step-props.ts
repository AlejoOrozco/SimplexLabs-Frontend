import type { Dispatch, SetStateAction } from 'react';
import type { OnboardingWizardState } from '@/lib/types/onboarding';

export interface OnboardingStepProps {
  state: OnboardingWizardState;
  onUpdate: Dispatch<SetStateAction<OnboardingWizardState>>;
}
