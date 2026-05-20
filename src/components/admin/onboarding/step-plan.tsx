'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { OnboardingFormField } from '@/components/admin/onboarding/onboarding-form-field';
import type { OnboardingStepProps } from '@/components/admin/onboarding/onboarding-step-props';
import { buildOnboardingPlanPickRows } from '@/lib/plans/group-plans-for-onboarding';
import { usePlans } from '@/lib/hooks/use-plans';
import { Niche } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export function StepPlan({ state, onUpdate }: OnboardingStepProps): JSX.Element {
  const { data: plans = [], isLoading } = usePlans();
  const rows = useMemo(
    () => buildOnboardingPlanPickRows(plans, state.company.niche ?? Niche.GYM),
    [plans, state.company.niche],
  );

  return (
    <div className="space-y-6">
      <OnboardingFormField label="Plans" required>
        <p className="mb-3 text-xs text-text-secondary">
          Showing active plans for{' '}
          <span className="font-medium text-text-primary">{state.company.niche ?? Niche.GYM}</span> across
          categories. Pick one cell; tier is inferred from the catalog.
        </p>
        {isLoading ? (
          <p className="text-sm text-text-secondary">Loading plans…</p>
        ) : (
          <div className="space-y-6">
            {rows.map((row) => (
              <div key={row.category}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {row.categoryLabel}
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {row.cells.map((cell) => {
                    const selected = cell.plan ? state.plan.planId === cell.plan.id : false;
                    return (
                      <button
                        key={`${row.category}-${cell.tier}`}
                        type="button"
                        disabled={!cell.plan}
                        onClick={() => {
                          if (!cell.plan) return;
                          onUpdate((s) => ({ ...s, plan: { ...s.plan, planId: cell.plan?.id ?? '' } }));
                        }}
                        className={cn(
                          'rounded-lg border p-3 text-left transition-colors',
                          !cell.plan && 'cursor-not-allowed border-border-default bg-surface-raised opacity-60',
                          cell.plan && !selected && 'border-border-default bg-surface-page hover:border-brand-500',
                          selected && 'border-brand-500 bg-brand-50 ring-1 ring-brand-500',
                        )}
                      >
                        <p className="text-xs font-semibold text-text-secondary">{cell.tierLabel}</p>
                        {cell.plan ? (
                          <>
                            <p className="mt-2 text-sm font-medium text-text-primary">{cell.plan.name}</p>
                            <p className="mt-1 text-xs text-text-secondary">
                              {formatCurrency(cell.plan.priceMonthly)} / mo · setup {formatCurrency(cell.plan.setupFee)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-sm text-text-secondary">No plan in catalog</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </OnboardingFormField>

      <OnboardingFormField label="Initial payment" required>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(state.plan.initialPayment) ? state.plan.initialPayment : 0}
          onChange={(e) => {
            const initialPayment = Number.parseFloat(e.target.value);
            onUpdate((s) => ({
              ...s,
              plan: {
                ...s.plan,
                initialPayment: Number.isFinite(initialPayment) ? initialPayment : 0,
              },
            }));
          }}
        />
      </OnboardingFormField>

      <OnboardingFormField label="Subscription start" required>
        <Input
          type="date"
          value={state.plan.startedAt}
          onChange={(e) =>
            onUpdate((s) => ({ ...s, plan: { ...s.plan, startedAt: e.target.value } }))
          }
        />
      </OnboardingFormField>

      <OnboardingFormField label="Next billing (optional)">
        <Input
          type="date"
          value={state.plan.nextBillingAt ?? ''}
          onChange={(e) =>
            onUpdate((s) => ({
              ...s,
              plan: { ...s.plan, nextBillingAt: e.target.value || undefined },
            }))
          }
        />
      </OnboardingFormField>
    </div>
  );
}
