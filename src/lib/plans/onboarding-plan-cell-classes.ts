import { PlanFeatureType } from '@/lib/types';

export function onboardingPlanCellInteractiveClasses(
  category: PlanFeatureType,
  opts: { disabled: boolean; selected: boolean; hasPlan: boolean },
): string {
  const { disabled, selected, hasPlan } = opts;

  if (disabled || !hasPlan) {
    return 'cursor-not-allowed border-border-default bg-surface-raised text-text-secondary opacity-60 md:opacity-70';
  }

  const pillarIdle = {
    [PlanFeatureType.AGENTS]:
      'border-border-default bg-surface-base hover:border-border-agents hover:bg-[var(--color-agents-surface)]',
    [PlanFeatureType.WEBSITE]:
      'border-border-default bg-surface-base hover:border-border-website hover:bg-[var(--color-website-surface)]',
    [PlanFeatureType.MARKETING]:
      'border-border-default bg-surface-base hover:border-border-marketing hover:bg-[var(--color-marketing-surface)]',
  } as const;

  const pillarSelected = {
    [PlanFeatureType.AGENTS]:
      'border-border-agents bg-[var(--color-agents-surface)] text-text-primary card-glow-agents',
    [PlanFeatureType.WEBSITE]:
      'border-border-website bg-[var(--color-website-surface)] text-text-primary card-glow-website',
    [PlanFeatureType.MARKETING]:
      'border-border-marketing bg-[var(--color-marketing-surface)] text-text-primary card-glow-marketing',
  } as const;

  if (selected) {
    return pillarSelected[category];
  }

  return pillarIdle[category];
}

export function planCategoryHeadingClass(category: PlanFeatureType): string {
  switch (category) {
    case PlanFeatureType.AGENTS:
      return 'text-text-agents';
    case PlanFeatureType.WEBSITE:
      return 'text-text-website';
    case PlanFeatureType.MARKETING:
      return 'text-text-marketing';
    default:
      return 'text-text-secondary';
  }
}
