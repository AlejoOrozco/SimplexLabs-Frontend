'use client';

import { Globe } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { WebsiteCard } from '@/components/websites/WebsiteCard';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { useWebsites } from '@/lib/hooks/use-websites';
import { subscriptionIncludesActiveWebsitePlan } from '@/lib/websites/subscription-includes-active-website-plan';

function WebsitesPageSkeleton(): JSX.Element {
  return (
    <PageShell title="Websites" description="Your web presence">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-border-default bg-surface-page shadow-sm"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default function WebsitesPage(): JSX.Element {
  const websitesQuery = useWebsites();
  const subscriptionsQuery = useSubscriptions();

  const isLoading = websitesQuery.isLoading || subscriptionsQuery.isLoading;
  const websites = websitesQuery.data;
  const subscriptions = subscriptionsQuery.data;

  const hasWebsitePlan = subscriptionIncludesActiveWebsitePlan(subscriptions);

  if (isLoading) return <WebsitesPageSkeleton />;

  if (!hasWebsitePlan) {
    return (
      <PageShell title="Websites" description="Your web presence">
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title="No website plan active"
          description="Your account does not currently include a website plan. Contact SimplexLabs to add one."
          className="min-h-[50vh] flex-1 justify-center py-16"
        />
      </PageShell>
    );
  }

  if (!websites?.length) {
    return (
      <PageShell title="Websites" description="Your web presence">
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title="No websites assigned yet"
          description="SimplexLabs will assign your website here once it is ready."
          className="min-h-[50vh] flex-1 justify-center py-16"
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Websites" description="Your web presence managed by SimplexLabs">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {websites.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>
    </PageShell>
  );
}
