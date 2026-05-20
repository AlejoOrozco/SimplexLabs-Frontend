'use client';

import { cn } from '@/lib/utils/cn';
import type { OnboardingWizardState } from '@/lib/types/onboarding';

export interface WizardStepMeta {
  number: OnboardingWizardState['step'];
  label: string;
}

interface StepIndicatorProps {
  steps: readonly WizardStepMeta[];
  currentStep: OnboardingWizardState['step'];
  onStepClick: (step: OnboardingWizardState['step']) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps): JSX.Element {
  return (
    <nav aria-label="Onboarding steps" className="flex flex-wrap gap-2">
      {steps.map((s) => {
        const isCurrent = s.number === currentStep;
        return (
          <button
            key={s.number}
            type="button"
            onClick={() => onStepClick(s.number)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isCurrent
                ? 'border-border-focus bg-surface-raised text-text-brand shadow-brand'
                : 'border-border-default bg-surface-base text-text-secondary hover:bg-surface-raised',
            )}
          >
            <span className="tabular-nums">{s.number}</span>
            <span className="ml-1.5 hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
