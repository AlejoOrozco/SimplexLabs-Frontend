import { apiGet } from '@/lib/api/client';
import type { PlanFeatureType } from '@/lib/types';

export interface BillingHistoryRow {
  id: string;
  createdAt: string;
  amountCents: number;
  status: string;
  description: string | null;
}

export interface ScheduledSubscriptionUpgrade {
  planName: string;
  effectiveAt: string;
}

export interface ClientSubscriptionBillingOverview {
  subscriptionsByCategory: Array<{
    category: PlanFeatureType | string;
    planName: string;
    status: string;
    nextBillingAt: string | null;
  }>;
  billingHistory: BillingHistoryRow[];
  scheduledUpgrade: ScheduledSubscriptionUpgrade | null;
}

export async function getClientSubscriptionBillingOverview(): Promise<ClientSubscriptionBillingOverview> {
  return apiGet<ClientSubscriptionBillingOverview>('/subscriptions/billing-overview');
}
