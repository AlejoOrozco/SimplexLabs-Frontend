import type { CompanyManageSectionId } from '@/lib/admin/admin-company-workspace-href';
import { AdminPlanCategory, AdminPlanTier } from '@/lib/types/admin-hub';
import { PlanFeatureType } from '@/lib/types';

/** Map backend `AI_AGENTS` category to frontend {@link PlanFeatureType.AGENTS}. */
export function adminPlanCategoryToFeatureType(
  category: AdminPlanCategory | null | undefined,
): PlanFeatureType | null {
  if (!category) return null;
  if (category === AdminPlanCategory.WEBSITE) return PlanFeatureType.WEBSITE;
  if (category === AdminPlanCategory.MARKETING) return PlanFeatureType.MARKETING;
  return PlanFeatureType.AGENTS;
}

/** Map frontend plan feature type to admin API category param. */
export function featureTypeToAdminPlanCategory(
  feature: PlanFeatureType,
): AdminPlanCategory {
  if (feature === PlanFeatureType.WEBSITE) return AdminPlanCategory.WEBSITE;
  if (feature === PlanFeatureType.MARKETING) return AdminPlanCategory.MARKETING;
  return AdminPlanCategory.AI_AGENTS;
}

export function adminPlanCategoryLabel(category: AdminPlanCategory): string {
  switch (category) {
    case AdminPlanCategory.WEBSITE:
      return 'Website';
    case AdminPlanCategory.MARKETING:
      return 'Marketing';
    case AdminPlanCategory.AI_AGENTS:
      return 'AI Agents';
  }
}

export function adminPlanTierLabel(tier: AdminPlanTier): string {
  switch (tier) {
    case AdminPlanTier.BASIC:
      return 'Basic';
    case AdminPlanTier.PROFESSIONAL:
      return 'Professional';
    case AdminPlanTier.ENTERPRISE:
      return 'Enterprise';
  }
}

export function adminSetupGapLabel(code: string): string {
  switch (code) {
    case 'NO_WEBSITE_PLAN':
      return 'No website plan';
    case 'NO_MARKETING_PLAN':
      return 'No marketing plan';
    case 'NO_AGENTS_PLAN':
      return 'No agents plan';
    case 'NO_PRIMARY_USER':
      return 'No primary user';
    case 'NO_WEBSITE':
      return 'No website assigned';
    case 'NO_AGENT_CONFIG':
      return 'No agent configuration';
    default:
      return code;
  }
}

/** Maps setup gap codes to Manage tab sections for deep links. */
export function adminSetupGapToManageSection(code: string): CompanyManageSectionId {
  switch (code) {
    case 'NO_WEBSITE_PLAN':
    case 'NO_MARKETING_PLAN':
    case 'NO_AGENTS_PLAN':
      return 'subscriptions';
    case 'NO_PRIMARY_USER':
      return 'users';
    case 'NO_WEBSITE':
      return 'websites';
    case 'NO_AGENT_CONFIG':
      return 'agent';
    default:
      return 'overview';
  }
}

/** Normalize plan category from subscription/plan payloads (handles `AGENTS` vs `AI_AGENTS`). */
export function subscriptionPlanCategory(subscription: {
  plan?: { category?: string | null } | null;
}): AdminPlanCategory | null {
  const raw = subscription.plan?.category;
  if (!raw) return null;
  if (raw === AdminPlanCategory.WEBSITE || raw === AdminPlanCategory.MARKETING) return raw;
  if (raw === AdminPlanCategory.AI_AGENTS || raw === PlanFeatureType.AGENTS) {
    return AdminPlanCategory.AI_AGENTS;
  }
  return null;
}

export function subscriptionMatchesCategory(
  subscription: { plan?: { category?: string | null } | null },
  category: AdminPlanCategory,
): boolean {
  return subscriptionPlanCategory(subscription) === category;
}
