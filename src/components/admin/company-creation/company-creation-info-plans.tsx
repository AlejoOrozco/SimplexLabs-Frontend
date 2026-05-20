'use client';

import { useMemo } from 'react';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildOnboardingPlanPickRows } from '@/lib/plans/group-plans-for-onboarding';
import {
  onboardingPlanCellInteractiveClasses,
  planCategoryHeadingClass,
} from '@/lib/plans/onboarding-plan-cell-classes';
import type { CompanyBillingCycle } from '@/lib/types/admin-provisioning';
import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import { setCompanyWizardBillingCycle, upsertPlanDraftRow } from '@/lib/types/company-creation-wizard-state';
import { Niche, PlanFeatureType, type Plan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

function categoryHeading(feature: PlanFeatureType): string {
  if (feature === PlanFeatureType.WEBSITE) return 'Website';
  if (feature === PlanFeatureType.MARKETING) return 'Marketing';
  return 'AI agents';
}

const NICHE_OPTIONS = [Niche.GYM, Niche.MEDICAL, Niche.ENTREPRENEUR] as const;

const ANNUAL_SAVINGS_LABEL = 'save ~17%';

interface CompanyInfoAndPlansSectionsProps {
  state: CompanyWizardState;
  plans: readonly Plan[];
  plansLoading: boolean;
  onUpdate: (updater: (s: CompanyWizardState) => CompanyWizardState) => void;
}

export function CompanyInfoStepSection({ state, onUpdate }: CompanyInfoAndPlansSectionsProps): JSX.Element {
  const { info } = state;
  return (
    <div className="space-y-6">
      <OnboardingFormField label="Company name" required>
        <Input
          value={info.name}
          onChange={(e) => onUpdate((s) => ({ ...s, info: { ...s.info, name: e.target.value } }))}
          placeholder="Juanito's Shoes"
        />
      </OnboardingFormField>

      <OnboardingFormField label="Niche" required>
        <Select
          value={info.niche}
          onValueChange={(v) =>
            onUpdate((s) => ({
              ...s,
              info: { ...s.info, niche: v as Niche },
              plans: [],
              agentConfig: null,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NICHE_OPTIONS.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </OnboardingFormField>

      <OnboardingFormField label="Phone" className="max-w-md">
        <Input value={info.phone} onChange={(e) => onUpdate((s) => ({ ...s, info: { ...s.info, phone: e.target.value } }))} />
      </OnboardingFormField>

      <OnboardingFormField label="Address" className="max-w-xl">
        <Input
          value={info.address}
          onChange={(e) => onUpdate((s) => ({ ...s, info: { ...s.info, address: e.target.value } }))}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Notification phone" className="max-w-md">
        <p className="mb-1.5 text-xs text-text-secondary">
          Juanito&apos;s personal WhatsApp for agent alerts (optional).
        </p>
        <Input
          value={info.notificationPhone}
          onChange={(e) => onUpdate((s) => ({ ...s, info: { ...s.info, notificationPhone: e.target.value } }))}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Notification email" className="max-w-md">
        <p className="mb-1.5 text-xs text-text-secondary">Fallback notification email (optional).</p>
        <Input
          type="email"
          value={info.notificationEmail}
          onChange={(e) => onUpdate((s) => ({ ...s, info: { ...s.info, notificationEmail: e.target.value } }))}
        />
      </OnboardingFormField>
    </div>
  );
}

export function CompanyPlansStepSection({
  state,
  plans,
  plansLoading,
  onUpdate,
}: CompanyInfoAndPlansSectionsProps): JSX.Element {
  const rows = useMemo(() => buildOnboardingPlanPickRows(plans, state.info.niche), [plans, state.info.niche]);

  const selectPlan = (category: PlanFeatureType, planId: string | undefined): void => {
    onUpdate((s) => {
      const current = s.plans.find((p) => p.category === category)?.planId;
      if (planId === undefined) return s;
      if (current === planId) {
        return upsertPlanDraftRow(s, category, undefined);
      }
      return upsertPlanDraftRow(s, category, planId);
    });
  };

  const setBilling = (billingCycle: CompanyBillingCycle): void => {
    onUpdate((s) => setCompanyWizardBillingCycle(s, billingCycle));
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-text-primary">Plans</p>
        <p className="mt-1 text-xs text-text-secondary">
          At most one plan per category. All categories can stay empty — plans can be added later.
        </p>
      </div>

      {plansLoading ? (
        <p className="text-sm text-text-secondary">Loading plans…</p>
      ) : (
        <div className="space-y-10">
          {rows.map((row) => {
            const selectedId = state.plans.find((p) => p.category === row.category)?.planId;
            return (
              <div key={row.category}>
                <p
                  className={cn(
                    'mb-3 text-xs font-bold uppercase tracking-wider',
                    planCategoryHeadingClass(row.category),
                  )}
                >
                  {categoryHeading(row.category)}
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {row.cells.map((cell) => {
                    const plan = cell.plan;
                    const selected = plan ? selectedId === plan.id : false;
                    const desc = plan?.description?.trim() || '—';

                    return (
                      <button
                        key={`${row.category}-${cell.tier}`}
                        type="button"
                        disabled={!plan}
                        onClick={() => {
                          if (!plan) return;
                          selectPlan(row.category, plan.id);
                        }}
                        className={cn(
                          'flex min-h-[11rem] flex-col rounded-xl border p-4 text-left transition-colors',
                          onboardingPlanCellInteractiveClasses(row.category, {
                            disabled: !plan,
                            selected,
                            hasPlan: Boolean(plan),
                          }),
                        )}
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">{cell.tierLabel}</p>
                        {plan ? (
                          <>
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-text-secondary">{plan.name}</p>
                            <p className="mt-3 text-2xl font-semibold tabular-nums text-text-primary">
                              {formatCurrency(plan.priceMonthly)}
                              <span className="text-sm font-normal text-text-secondary">/mo</span>
                            </p>
                            <p className="mt-1 text-xs text-text-secondary">
                              Setup {formatCurrency(plan.setupFee)}
                            </p>
                            <p className="mt-2 line-clamp-3 text-xs leading-snug text-text-secondary">{desc}</p>
                          </>
                        ) : (
                          <div className="mt-auto pt-4">
                            <p className="text-sm font-medium text-text-secondary">Not available</p>
                            <p className="mt-1 text-xs text-text-secondary">No plan in catalog for this tier.</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OnboardingFormField label="Billing cycle" required>
        <div className="flex flex-wrap gap-4">
          {(['MONTHLY', 'ANNUAL'] as const).map((cycle) => (
            <label
              key={cycle}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
                state.billingCycle === cycle
                  ? 'border-border-focus bg-surface-raised text-text-brand shadow-brand'
                  : 'border-border-default bg-surface-base',
              )}
            >
              <input
                type="radio"
                className="size-4"
                checked={state.billingCycle === cycle}
                onChange={() => setBilling(cycle)}
              />
              <span>
                {cycle === 'MONTHLY' ? 'Monthly' : `Annual (${ANNUAL_SAVINGS_LABEL})`}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Annual billing shows catalog annual totals when set; otherwise 12× monthly is used for estimates.
        </p>
      </OnboardingFormField>
    </div>
  );
}
