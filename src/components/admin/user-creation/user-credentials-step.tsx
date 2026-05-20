'use client';

import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { UserWizardState } from '@/lib/types/user-creation-wizard-state';

interface UserCredentialsStepProps {
  state: UserWizardState;
  onUpdate: (updater: (s: UserWizardState) => UserWizardState) => void;
}

export function UserCredentialsStep({ state, onUpdate }: UserCredentialsStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OnboardingFormField label="First name" required>
          <Input
            value={state.credentials.firstName}
            onChange={(e) =>
              onUpdate((s) => ({
                ...s,
                credentials: { ...s.credentials, firstName: e.target.value },
              }))
            }
          />
        </OnboardingFormField>
        <OnboardingFormField label="Last name" required>
          <Input
            value={state.credentials.lastName}
            onChange={(e) =>
              onUpdate((s) => ({
                ...s,
                credentials: { ...s.credentials, lastName: e.target.value },
              }))
            }
          />
        </OnboardingFormField>
      </div>

      <OnboardingFormField label="Email" required>
        <Input
          type="email"
          value={state.credentials.email}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              credentials: { ...s.credentials, email: e.target.value },
            }))
          }
          placeholder="name@company.com"
        />
      </OnboardingFormField>

      <p className="rounded-lg border border-border-default bg-surface-raised p-4 text-sm text-text-secondary">
        The server generates a strong password for this account. You will see it on the next screen so you can share
        it securely with the user.
      </p>
    </div>
  );
}
