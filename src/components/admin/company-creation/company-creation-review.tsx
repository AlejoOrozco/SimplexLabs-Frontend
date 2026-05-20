'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { buildAdminCreateCompanyDto } from '@/lib/onboarding/build-admin-create-company-dto';
import { companyHasAgentsPlan } from '@/lib/onboarding/company-creation-wizard-navigation';
import { paymentMethodLabel } from '@/lib/onboarding/payment-method-label';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import type { Plan } from '@/lib/types';
import { PlanFeatureType } from '@/lib/types';
import { channelLabel, formatCurrency, nicheLabel } from '@/lib/utils/format';

function categoryHeading(feature: PlanFeatureType): string {
  if (feature === PlanFeatureType.WEBSITE) return 'Website';
  if (feature === PlanFeatureType.MARKETING) return 'Marketing';
  return 'AI agents';
}

interface CompanyReviewStepSectionProps {
  state: CompanyWizardState;
  plans: readonly Plan[];
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function CompanyReviewStepSection({ state, plans, isSubmitting, onSubmit }: CompanyReviewStepSectionProps): JSX.Element {
  const dto = useMemo(() => buildAdminCreateCompanyDto(state), [state]);

  const planSummaries = useMemo(() => {
    return state.plans
      .map((row) => {
        const plan = plans.find((pl) => pl.id === row.planId);
        return plan ? { cat: row.category, plan } : null;
      })
      .filter((e): e is { cat: PlanFeatureType; plan: Plan } => e !== null);
  }, [plans, state.plans]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">Review everything before creating the company. No user account is created in this flow.</p>

      <details className="rounded-lg border border-border-default bg-surface-page" open>
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-text-primary">
          Company
        </summary>
        <div className="border-t border-border-default px-4 py-3 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between gap-2">
              <dt className="text-text-secondary">Name</dt>
              <dd className="text-right font-medium">{dto.name}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-secondary">Niche</dt>
              <dd className="text-right font-medium">{nicheLabel(dto.niche)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-secondary">Phone</dt>
              <dd className="text-right font-medium">{dto.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-secondary">Address</dt>
              <dd className="text-right font-medium">{dto.address ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </details>

      <details className="rounded-lg border border-border-default bg-surface-page" open>
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-text-primary">
          Plans ({dto.plans.length}) · {state.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
        </summary>
        <div className="border-t border-border-default px-4 py-3 text-sm">
          {planSummaries.length === 0 ? (
            <p className="text-text-secondary">No plans selected.</p>
          ) : (
            <ul className="space-y-2">
              {planSummaries.map(({ cat, plan }) =>
                plan ? (
                  <li key={cat} className="flex justify-between gap-2">
                    <span className="text-text-secondary">{categoryHeading(cat)}</span>
                    <span className="text-right font-medium">
                      {plan.name} · {formatCurrency(plan.priceMonthly)}/mo
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
      </details>

      {companyHasAgentsPlan(state) && dto.agentConfig ? (
        <details className="rounded-lg border border-border-default bg-surface-page" open>
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-text-primary">
            Agent
          </summary>
          <div className="border-t border-border-default px-4 py-3 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-text-secondary">Name</dt>
                <dd className="text-right font-medium">{dto.agentConfig.name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-secondary">Channels</dt>
                <dd className="text-right font-medium">{dto.agentConfig.channels.map(channelLabel).join(', ')}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-secondary">Payments</dt>
                <dd className="text-right font-medium">
                  {dto.agentConfig.paymentMethods.map(paymentMethodLabel).join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </details>
      ) : null}

      <details className="rounded-lg border border-border-default bg-surface-page" open>
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-text-primary">
          WhatsApp
        </summary>
        <div className="border-t border-border-default px-4 py-3 text-sm">
          {state.whatsapp.skip ? (
            <p className="text-text-secondary">Skipped — configure later.</p>
          ) : (
            <dl className="space-y-2">
              <div className="flex justify-between gap-2">
                <dt className="text-text-secondary">Phone number ID</dt>
                <dd className="min-w-0 break-all text-right font-medium">{dto.whatsappPhoneNumberId ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-secondary">Phone number</dt>
                <dd className="text-right font-medium">{dto.whatsappPhoneNumber ?? '—'}</dd>
              </div>
            </dl>
          )}
        </div>
      </details>

      <Button type="button" className="w-full" disabled={isSubmitting} onClick={() => void onSubmit()}>
        {isSubmitting ? 'Creating…' : 'Create company'}
      </Button>
    </div>
  );
}
