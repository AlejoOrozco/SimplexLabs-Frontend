'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import { paymentMethodLabel } from '@/lib/onboarding/payment-method-label';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import { WHATSAPP_CREDENTIALS_SAVE_ENABLED } from '@/lib/constants/whatsapp-config';
import { Channel, type Plan } from '@/lib/types';
import type { PaymentMethod } from '@/lib/types/onboarding';
import { PaymentMethod as PaymentMethodEnum } from '@/lib/types/onboarding';
import { channelLabel } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const CHANNELS: readonly Channel[] = [Channel.WHATSAPP, Channel.INSTAGRAM, Channel.MESSENGER];

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  PaymentMethodEnum.CARD,
  PaymentMethodEnum.BANK_TRANSFER,
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.OTHER,
];

function toggleList<T>(current: T[], value: T): T[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

interface CompanyWizardStepProps {
  state: CompanyWizardState;
  plans: readonly Plan[];
  onUpdate: (updater: (s: CompanyWizardState) => CompanyWizardState) => void;
}

export function CompanyAgentStepSection({ state, onUpdate }: CompanyWizardStepProps): JSX.Element {
  const agent = state.agentConfig;
  if (!agent) {
    return (
      <p className="text-sm text-text-secondary">
        Select an AI agents plan to configure the agent for this company.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <OnboardingFormField label="Agent name" required>
        <Input
          value={agent.name}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              agentConfig: s.agentConfig ? { ...s.agentConfig, name: e.target.value } : s.agentConfig,
            }))
          }
          placeholder="Sofía"
        />
      </OnboardingFormField>

      <OnboardingFormField label="Fallback message" required>
        <Textarea
          value={agent.fallbackMessage}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              agentConfig: s.agentConfig
                ? { ...s.agentConfig, fallbackMessage: e.target.value }
                : s.agentConfig,
            }))
          }
          rows={3}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Escalation message" required>
        <Textarea
          value={agent.escalationMessage}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              agentConfig: s.agentConfig
                ? { ...s.agentConfig, escalationMessage: e.target.value }
                : s.agentConfig,
            }))
          }
          rows={3}
        />
      </OnboardingFormField>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-primary">Channels</legend>
        <div className="flex flex-wrap gap-3">
          {CHANNELS.map((ch) => {
            const checked = agent.channels.includes(ch);
            return (
              <label
                key={ch}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  checked ? 'border-border-focus bg-surface-raised shadow-brand' : 'border-border-default',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border-default"
                  checked={checked}
                  onChange={() =>
                    onUpdate((s) => ({
                      ...s,
                      agentConfig: s.agentConfig
                        ? {
                            ...s.agentConfig,
                            channels: toggleList(s.agentConfig.channels, ch),
                          }
                        : s.agentConfig,
                    }))
                  }
                />
                {channelLabel(ch)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-primary">Payment methods</legend>
        <div className="flex flex-wrap gap-3">
          {PAYMENT_METHODS.map((m) => {
            const checked = agent.paymentMethods.includes(m);
            return (
              <label
                key={m}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  checked ? 'border-border-focus bg-surface-raised shadow-brand' : 'border-border-default',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border-default"
                  checked={checked}
                  onChange={() =>
                    onUpdate((s) => ({
                      ...s,
                      agentConfig: s.agentConfig
                        ? {
                            ...s.agentConfig,
                            paymentMethods: toggleList(s.agentConfig.paymentMethods, m),
                          }
                        : s.agentConfig,
                    }))
                  }
                />
                {paymentMethodLabel(m)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

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

      <OnboardingFormField label="Phone number" className="max-w-md">
        <p className="text-xs text-text-secondary">E.164 format, e.g. +14155552671</p>
        <Input
          value={whatsapp.phoneNumber}
          disabled={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, phoneNumber: e.target.value } }))}
          type="tel"
          placeholder="+14155552671"
        />
      </OnboardingFormField>

      <OnboardingFormField label="Phone number ID" className="max-w-xl">
        <p className="text-xs text-text-secondary">
          From your WhatsApp provider dashboard; use &quot;sandbox&quot; for sandbox
        </p>
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

          <OnboardingFormField label="API base URL (optional)" className="max-w-xl">
            <p className="text-xs text-text-secondary">Default sandbox: https://waba-sandbox.360dialog.io</p>
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
