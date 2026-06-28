import { subscriptionMatchesCategory } from '@/lib/admin/admin-hub-utils';
import { SubStatus, type Subscription } from '@/lib/types';
import { AdminPlanCategory } from '@/lib/types/admin-hub';

export function companyHasActiveAgentsPlan(
  companyId: string,
  subscriptions: Subscription[] | undefined,
): boolean {
  if (!subscriptions?.length) return false;
  return subscriptions.some(
    (s) =>
      s.companyId === companyId &&
      s.status === SubStatus.ACTIVE &&
      subscriptionMatchesCategory(s, AdminPlanCategory.AI_AGENTS),
  );
}
