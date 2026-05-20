'use client';

import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { cn } from '@/lib/utils/cn';

export function StepWhatsApp({ state, onUpdate }: OnboardingStepProps): JSX.Element {
  const { whatsapp } = state;
  const disabled = whatsapp.skip;

  return (
    <div className="space-y-6">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="size-4 rounded border-border-default"
          checked={whatsapp.skip}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              whatsapp: { ...s.whatsapp, skip: e.target.checked },
            }))
          }
        />
        Skip WhatsApp setup for now
      </label>

      <OnboardingFormField label="Phone number ID">
        <Input
          disabled={disabled}
          value={whatsapp.phoneNumberId ?? ''}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              whatsapp: { ...s.whatsapp, phoneNumberId: e.target.value },
            }))
          }
          className={cn(disabled && 'opacity-60')}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Phone number">
        <Input
          type="tel"
          disabled={disabled}
          value={whatsapp.phoneNumber ?? ''}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              whatsapp: { ...s.whatsapp, phoneNumber: e.target.value },
            }))
          }
          className={cn(disabled && 'opacity-60')}
        />
      </OnboardingFormField>
    </div>
  );
}
