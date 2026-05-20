import { PlanFeatureType, type Niche, type Plan } from '@/lib/types';

export type PlanTierSlot = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface OnboardingPlanPickCell {
  tier: PlanTierSlot;
  tierLabel: string;
  plan: Plan | null;
}

export interface OnboardingPlanPickRow {
  category: PlanFeatureType;
  categoryLabel: string;
  cells: OnboardingPlanPickCell[];
}

const TIER_LABEL: Record<PlanTierSlot, string> = {
  BASIC: 'Basic',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

const CATEGORY_LABEL: Record<PlanFeatureType, string> = {
  [PlanFeatureType.WEBSITE]: 'Website',
  [PlanFeatureType.MARKETING]: 'Marketing',
  [PlanFeatureType.AGENTS]: 'Agents',
};

const CATEGORY_ORDER: PlanFeatureType[] = [
  PlanFeatureType.WEBSITE,
  PlanFeatureType.MARKETING,
  PlanFeatureType.AGENTS,
];

const VALID_PLAN_PRODUCT_CATEGORY = new Set<string>(Object.values(PlanFeatureType));

/** Parses plan-level `category` from API when it matches catalog product lines. */
export function parsePlanProductCategory(value: unknown): PlanFeatureType | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!VALID_PLAN_PRODUCT_CATEGORY.has(trimmed)) return null;
  return trimmed as PlanFeatureType;
}

export function inferPlanTierFromName(name: string): PlanTierSlot | null {
  const n = name.toLowerCase();
  if (n.includes('enterprise') || n.includes('empresarial')) return 'ENTERPRISE';
  if (
    n.includes('professional') ||
    n.includes('profesional') ||
    /\bpro\b/.test(n)
  ) {
    return 'PROFESSIONAL';
  }
  if (n.includes('basic') || n.includes('starter') || n.includes('básico') || n.includes('basico')) {
    return 'BASIC';
  }
  return null;
}

export function primaryPlanCategory(plan: Plan): PlanFeatureType {
  const feats = new Set(plan.features.map((f) => f.feature));
  for (const c of CATEGORY_ORDER) {
    if (feats.has(c)) return c;
  }
  const fromPlanColumn = parsePlanProductCategory(plan.category);
  if (fromPlanColumn) return fromPlanColumn;
  return PlanFeatureType.AGENTS;
}

/**
 * Rows = product categories, columns = tier slots. Only active plans for the onboarded niche are considered.
 */
export function buildOnboardingPlanPickRows(plans: readonly Plan[], niche: Niche): OnboardingPlanPickRow[] {
  const filtered = plans.filter((p) => p.niche === niche && p.isActive);
  const tiers: PlanTierSlot[] = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'];

  return CATEGORY_ORDER.map((category) => {
    const inCategory = filtered.filter((p) => primaryPlanCategory(p) === category);
    const cells: OnboardingPlanPickCell[] = tiers.map((tier) => {
      const direct = inCategory.find((p) => inferPlanTierFromName(p.name) === tier) ?? null;
      return { tier, tierLabel: TIER_LABEL[tier], plan: direct };
    });

    const unmatched = inCategory.filter((p) => inferPlanTierFromName(p.name) === null);
    for (const plan of unmatched) {
      const emptyIdx = cells.findIndex((c) => c.plan === null);
      if (emptyIdx < 0) break;
      const slot = cells[emptyIdx];
      if (!slot) break;
      cells[emptyIdx] = { tier: slot.tier, tierLabel: slot.tierLabel, plan };
    }

    return {
      category,
      categoryLabel: CATEGORY_LABEL[category],
      cells,
    };
  });
}
