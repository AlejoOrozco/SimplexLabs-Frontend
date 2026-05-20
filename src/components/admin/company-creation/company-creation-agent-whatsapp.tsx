'use client';

import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getChannelConfig, orderedAllChannels } from '@/lib/onboarding/plan-channel-config';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import { getAgentsPlanId } from '@/lib/types/company-creation-wizard-state';
import { notify } from '@/lib/toast';
import { PaymentMethod as PaymentMethodEnum, type PaymentMethod } from '@/lib/types/onboarding';
import { channelLabel } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Channel, Plan } from '@/lib/types';

const AGENT_PAYMENT_METHODS: readonly PaymentMethod[] = [PaymentMethodEnum.CARD, PaymentMethodEnum.BANK_TRANSFER];

function toggleList<T>(current: readonly T[], value: T): T[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

interface CompanyAgentStepSectionProps {
  state: CompanyWizardState;
  plans: readonly Plan[];
  onUpdate: (updater: (s: CompanyWizardState) => CompanyWizardState) => void;
}

export function CompanyAgentStepSection({ state, plans, onUpdate }: CompanyAgentStepSectionProps): JSX.Element {
  const agentsPlanId = getAgentsPlanId(state);
  const agentsPlan = plans.find((p) => p.id === agentsPlanId) ?? null;
  const cfg = getChannelConfig(agentsPlan);
  const ac = state.agentConfig;

  if (!ac) {
    return <p className="text-sm text-text-secondary">Select an AI Agents plan in the previous step.</p>;
  }

  const updateAgent = (partial: Partial<NonNullable<CompanyWizardState['agentConfig']>>): void => {
    onUpdate((s) => {
      if (!s.agentConfig) return s;
      return { ...s, agentConfig: { ...s.agentConfig, ...partial } };
    });
  };

  const handleChannelToggle = (ch: Channel, checked: boolean): void => {
    if (checked) {
      updateAgent({ channels: toggleList(ac.channels, ch) });
      return;
    }
    if (ac.channels.length >= cfg.maxChannels) {
      if (cfg.maxChannels === 1) {
        updateAgent({ channels: [ch] });
        return;
      }
      notify.warning(`This plan allows up to ${cfg.maxChannels} channels.`, {
        description: 'Deselect a channel before adding another, or choose a higher tier in Plans.',
      });
      return;
    }
    updateAgent({ channels: toggleList(ac.channels, ch) });
  };

  return (
    <div className="space-y-6">
      <OnboardingFormField label="Agent name" required>
        <Input value={ac.name} onChange={(e) => updateAgent({ name: e.target.value })} placeholder="Sofía" />
      </OnboardingFormField>

      <OnboardingFormField label="Fallback message" required>
        <Textarea
          value={ac.fallbackMessage}
          onChange={(e) => updateAgent({ fallbackMessage: e.target.value })}
          rows={3}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Escalation message" required>
        <Textarea
          value={ac.escalationMessage}
          onChange={(e) => updateAgent({ escalationMessage: e.target.value })}
          rows={3}
        />
      </OnboardingFormField>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-primary">Channels</legend>
        <p className="text-xs text-text-secondary">
          Basic includes 1 channel, Professional up to 2, Enterprise up to 3. Tier is detected from the plan name
          (Basic / Professional / Enterprise). Choose any combination within your limit.
        </p>
        {cfg.locked ? (
          <p className="text-sm text-text-secondary">Select an AI Agents plan in the previous step to enable channels.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {orderedAllChannels().map((ch) => {
              const checked = ac.channels.includes(ch);
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
                    onChange={() => handleChannelToggle(ch, checked)}
                  />
                  {channelLabel(ch)}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-primary">Payment methods</legend>
        <div className="flex flex-wrap gap-3">
          {AGENT_PAYMENT_METHODS.map((m) => {
            const checked = ac.paymentMethods.includes(m);
            const label = m === PaymentMethodEnum.CARD ? 'Card (Stripe)' : 'Bank transfer';
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
                  onChange={() => updateAgent({ paymentMethods: toggleList(ac.paymentMethods, m) })}
                />
                {label}
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
        This is the WhatsApp Business number assigned to this company. Required for the AI agent to send and receive
        messages. You can skip and configure later.
      </p>

      <OnboardingFormField label="Phone number ID (Meta)" className="max-w-xl">
        <Input
          value={whatsapp.phoneNumberId}
          disabled={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, phoneNumberId: e.target.value } }))}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Phone number" className="max-w-md">
        <Input
          value={whatsapp.phoneNumber}
          disabled={whatsapp.skip}
          onChange={(e) => onUpdate((s) => ({ ...s, whatsapp: { ...s.whatsapp, phoneNumber: e.target.value } }))}
        />
      </OnboardingFormField>

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
