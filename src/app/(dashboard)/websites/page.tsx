'use client';

import { Globe } from 'lucide-react';
import { PageMeta } from '@/components/layout/page-meta';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { WebsiteCard } from '@/components/websites/WebsiteCard';
import { useAuth } from '@/context/auth-context';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { useWebsites } from '@/lib/hooks/use-websites';
import { companyHasActiveWebsitePlan } from '@/lib/websites/company-has-active-website-plan';

const WEBSITES_TITLE = 'Websites';

function WebsitesPageSkeleton(): JSX.Element {
  return (
    <>
      <PageMeta title={WEBSITES_TITLE} description="Your web presence" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="overflow-hidden rounded-xl border border-border-default bg-surface-base shadow-sm"
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
    </>
  );
}

export default function WebsitesPage(): JSX.Element {
  const { user } = useAuth();
  const websitesQuery = useWebsites();
  const subscriptionsQuery = useSubscriptions();

  const isLoading = websitesQuery.isLoading || subscriptionsQuery.isLoading;
  const websites = websitesQuery.data;
  const subscriptions = subscriptionsQuery.data;

  const hasWebsitePlan = companyHasActiveWebsitePlan(user?.companyId ?? '', subscriptions);

  if (isLoading) return <WebsitesPageSkeleton />;

  if (!hasWebsitePlan) {
    return (
      <>
        <PageMeta title={WEBSITES_TITLE} description="Your web presence" />
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title="No website plan active"
          description="Your account does not currently include a website plan. Contact SimplexLabs to add one."
          className="min-h-[50vh] flex-1 justify-center py-16"
        />
      </>
    );
  }

  if (!websites?.length) {
    return (
      <>
        <PageMeta title={WEBSITES_TITLE} description="Your web presence" />
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title="No websites assigned yet"
          description="SimplexLabs will assign your website here once it is ready."
          className="min-h-[50vh] flex-1 justify-center py-16"
        />
      </>
    );
  }

  return (
    <>
      <PageMeta title={WEBSITES_TITLE} description="Your web presence managed by SimplexLabs" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {websites.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>
    </>
  );
}
