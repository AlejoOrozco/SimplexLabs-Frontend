import type { Plan } from '@/lib/types';
import { Channel, PlanFeatureType } from '@/lib/types';
import { inferPlanTierFromName, primaryPlanCategory, type PlanTierSlot } from '@/lib/plans/group-plans-for-onboarding';

const ALL_ORDERED: readonly Channel[] = [Channel.WHATSAPP, Channel.INSTAGRAM, Channel.MESSENGER];

const TIER_MAX_CHANNELS: Record<PlanTierSlot, number> = {
  BASIC: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

export interface PlanChannelUiConfig {
  /** All standard channels shown in the picker when an AI Agents plan is selected. */
  readonly available: readonly Channel[];
  /** Max number of channels the tenant may enable (from plan tier: Basic 1, Pro 2, Enterprise 3). */
  readonly maxChannels: number;
  /** True when no AI Agents plan is selected (nothing to configure). */
  readonly locked: boolean;
}

export function maxChannelsForAgentsPlan(plan: Plan): number {
  const tier = inferPlanTierFromName(plan.name);
  if (tier) return TIER_MAX_CHANNELS[tier];
  const unique = [...new Set(plan.channels.map((c) => c.channel))];
  return Math.min(3, Math.max(1, unique.length));
}

/**
 * Channel picker rules from the selected AI Agents catalog plan: tier (from plan name) sets how many
 * of WhatsApp / Instagram / Messenger may be active at once. All three are always selectable when a plan exists.
 */
export function getChannelConfig(selectedAiAgentsPlan: Plan | null): PlanChannelUiConfig {
  if (!selectedAiAgentsPlan) {
    return { available: [], maxChannels: 0, locked: true };
  }
  return {
    available: [...ALL_ORDERED],
    maxChannels: maxChannelsForAgentsPlan(selectedAiAgentsPlan),
    locked: false,
  };
}

/** Default selection: first N channels in product order, where N = tier limit. */
export function defaultChannelsForAiAgentsPlan(plan: Plan | null): Channel[] {
  if (!plan) return [];
  const n = maxChannelsForAgentsPlan(plan);
  return ALL_ORDERED.slice(0, n);
}

function minSlotsForChannel(channel: Channel): number {
  if (channel === Channel.WHATSAPP) return 1;
  if (channel === Channel.INSTAGRAM) return 2;
  return 3;
}

/**
 * Cheapest active AI Agents plan in the niche that allows enough channel slots for `channel`
 * (Instagram needs Professional+, Messenger needs Enterprise+ under default tier rules).
 */
export function findCheapestAiAgentsPlanIncludingChannel(
  catalog: readonly Plan[],
  niche: Plan['niche'],
  channel: Channel,
): Plan | null {
  const needed = minSlotsForChannel(channel);
  const candidates = catalog.filter(
    (p) => p.isActive && p.niche === niche && primaryPlanCategory(p) === PlanFeatureType.AGENTS,
  );
  const matches = candidates.filter((p) => maxChannelsForAgentsPlan(p) >= needed);
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => a.priceMonthly - b.priceMonthly)[0] ?? null;
}

export function orderedAllChannels(): readonly Channel[] {
  return ALL_ORDERED;
}
