'use client';

import { Check, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { notify } from '@/lib/toast';
import { generateStrongPassword } from '@/lib/utils/generate-strong-password';

export function StepCredentials({ state, onUpdate }: OnboardingStepProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.credentials.generatedPassword) return;
    const password = generateStrongPassword();
    onUpdate((s) => ({
      ...s,
      credentials: { ...s.credentials, generatedPassword: password },
    }));
  }, [onUpdate, state.credentials.generatedPassword]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(state.credentials.generatedPassword);
      setCopied(true);
      notify.success('Password copied to clipboard');
    } catch {
      notify.error('Could not copy to clipboard');
    }
  };

  const handleRegenerate = (): void => {
    const password = generateStrongPassword();
    onUpdate((s) => ({
      ...s,
      credentials: { ...s.credentials, generatedPassword: password },
    }));
  };

  return (
    <div className="space-y-6">
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
          placeholder="juanito@juanitosshoes.com"
        />
      </OnboardingFormField>

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

      <div className="rounded-lg border border-border-default bg-surface-raised p-4">
        <p className="mb-2 text-sm font-medium text-text-primary">Generated password</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <code className="min-w-0 flex-1 rounded-md bg-surface-overlay px-3 py-2 font-mono text-sm text-text-primary">
            {state.credentials.generatedPassword || '…'}
          </code>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()}>
              {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              <span className="sr-only">Copy password</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleRegenerate}>
              <RefreshCw size={16} aria-hidden />
              <span className="sr-only">Regenerate password</span>
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Save this password before continuing — it will not be shown again after the account is created.
        </p>
      </div>
    </div>
  );
}
