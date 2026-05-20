import { SubStatus, type Subscription } from '@/lib/types';
import { planIncludesWebsiteCapability } from '@/lib/websites/plan-includes-website-capability';

export function subscriptionIncludesActiveWebsitePlan(
  subscriptions: Subscription[] | undefined,
): boolean {
  if (!subscriptions?.length) return false;
  return subscriptions.some(
    (s) => s.status === SubStatus.ACTIVE && planIncludesWebsiteCapability(s.plan),
  );
}
