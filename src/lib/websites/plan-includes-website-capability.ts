import { PlanFeatureType, type Plan } from '@/lib/types';

/**
 * True when the plan is a Website product line, either via explicit {@link Plan.category}
 * (common when the API omits {@link Plan.features} rows) or a WEBSITE feature row.
 */
export function planIncludesWebsiteCapability(plan: Plan | undefined): boolean {
  if (!plan) return false;
  if (plan.category === PlanFeatureType.WEBSITE) return true;
  return (plan.features ?? []).some((f) => f.feature === PlanFeatureType.WEBSITE);
}
