'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { paymentMethodLabel } from '@/lib/onboarding/payment-method-label';
import { Channel } from '@/lib/types';
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

export function StepAgent({ state, onUpdate }: OnboardingStepProps): JSX.Element {
  const { agent } = state;

  return (
    <div className="space-y-6">
      <OnboardingFormField label="Agent name" required>
        <Input
          value={agent.agentName}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              agent: { ...s.agent, agentName: e.target.value },
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
              agent: { ...s.agent, fallbackMessage: e.target.value },
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
              agent: { ...s.agent, escalationMessage: e.target.value },
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
                  checked ? 'border-brand-500 bg-brand-50' : 'border-border-default',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border-default"
                  checked={checked}
                  onChange={() =>
                    onUpdate((s) => ({
                      ...s,
                      agent: { ...s.agent, channels: toggleList(s.agent.channels, ch) },
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
                  checked ? 'border-brand-500 bg-brand-50' : 'border-border-default',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border-default"
                  checked={checked}
                  onChange={() =>
                    onUpdate((s) => ({
                      ...s,
                      agent: {
                        ...s.agent,
                        paymentMethods: toggleList(s.agent.paymentMethods, m),
                      },
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
