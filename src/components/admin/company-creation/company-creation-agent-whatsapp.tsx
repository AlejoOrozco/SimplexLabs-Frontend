'use client';

import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import { WHATSAPP_CREDENTIALS_SAVE_ENABLED } from '@/lib/constants/whatsapp-config';

// Re-export agent section unchanged — only WhatsApp section updated below.
export { CompanyAgentStepSection } from '@/components/admin/company-creation/company-creation-agent-section';

export function CompanyWhatsappStepSection({
  state,
  onUpdate,
}: {
  state: CompanyWizardState;
  onUpdate: (updater: (s: CompanyWizardState) => CompanyWizardState) => void;
}): JSX.Element {
  const { whatsapp } = state;
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Configure the WhatsApp Business number for this company. The AI agent uses these settings to send and receive
        messages. You can skip and configure later.
      </p>

      <OnboardingFormField
        label="Phone number"
        className="max-w-md"
        hint="E.164 format, e.g. +14155552671"
      >
        <Input
          value={whatsapp.phoneNumber}
          disabled={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, phoneNumber: e.target.value } }))}
          type="tel"
          placeholder="+14155552671"
        />
      </OnboardingFormField>

      <OnboardingFormField
        label="Phone number ID"
        className="max-w-xl"
        hint='From your WhatsApp provider dashboard; use "sandbox" for sandbox'
      >
        <Input
          value={whatsapp.phoneNumberId}
          disabled={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, phoneNumberId: e.target.value } }))}
        />
      </OnboardingFormField>

      {WHATSAPP_CREDENTIALS_SAVE_ENABLED ? (
        <>
          <OnboardingFormField label="WhatsApp API Key" className="max-w-xl">
            <Input
              type="password"
              autoComplete="new-password"
              value={whatsapp.apiKey}
              disabled={whatsapp.skip}
              onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, apiKey: e.target.value } }))}
            />
          </OnboardingFormField>

          <OnboardingFormField
            label="API base URL (optional)"
            className="max-w-xl"
            hint="Default sandbox: https://waba-sandbox.360dialog.io"
          >
            <Input
              value={whatsapp.baseUrl}
              disabled={whatsapp.skip}
              placeholder="https://waba-sandbox.360dialog.io"
              onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, baseUrl: e.target.value } }))}
            />
          </OnboardingFormField>
        </>
      ) : (
        <p className="text-xs text-text-secondary">
          API key and base URL can be configured in the database until admin save is enabled on the backend.
        </p>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="size-4 rounded border-border-default"
          checked={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, skip: e.target.checked } }))}
        />
        Skip for now
      </label>
    </div>
  );
}
