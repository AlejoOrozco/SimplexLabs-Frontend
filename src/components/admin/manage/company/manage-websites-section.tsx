'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { AddWebsiteModal } from '@/components/websites/AddWebsiteModal';
import { AdminWebsiteRow } from '@/components/websites/AdminWebsiteRow';
import { useAuth } from '@/context/auth-context';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { useAdminCompanyWebsites } from '@/lib/hooks/use-admin-company-websites';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { companyHasActiveWebsitePlan } from '@/lib/websites/company-has-active-website-plan';

interface ManageWebsitesSectionProps {
  companyId: string;
  companyIsInactive?: boolean;
  /** When true, shows Manage-specific heading and guidance (default). Tab view uses compact layout. */
  showManageIntro?: boolean;
}

export function ManageWebsitesSection({
  companyId,
  companyIsInactive = false,
  showManageIntro = true,
}: ManageWebsitesSectionProps): JSX.Element {
  const { isSimplexAdmin } = useAuth();
  const subscriptionsQuery = useSubscriptions();
  const websitesQuery = useAdminCompanyWebsites(companyId);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const hasWebsitePlan = companyHasActiveWebsitePlan(companyId, subscriptionsQuery.data);
  const websites = websitesQuery.data ?? [];
  const isLoading = websitesQuery.isLoading || subscriptionsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showManageIntro ? <Skeleton className="h-12 w-full max-w-xl" /> : null}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (companyIsInactive) {
    return (
      <p className="text-sm text-text-secondary">
        This company is inactive. Website changes are disabled until the company is reactivated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showManageIntro ? (
        <div>
          <h3 className="text-base font-semibold text-text-primary">Websites</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Assign website URLs to this company. Tenant users see them on their dashboard when an
            active Website plan is linked.
          </p>
        </div>
      ) : null}

      {!hasWebsitePlan ? (
        <div className="rounded-lg border border-warning bg-warning-surface px-4 py-3 text-sm text-warning-dark">
          <p>
            This company does not have an active Website plan. Tenant users will not see assigned
            websites on their dashboard until a Website plan is active. As a platform admin, you
            can still assign URLs below.
          </p>
          {showManageIntro ? (
            <Link
              href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
              scroll={false}
              className="mt-2 inline-block font-medium text-warning-dark underline hover:no-underline"
            >
              Assign a Website plan
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Assigned websites ({websites.length})
        </h4>
        {isSimplexAdmin ? (
          <Button type="button" size="sm" onClick={() => setAddModalOpen(true)}>
            + Add website
          </Button>
        ) : null}
      </div>

      {websites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description={
            isSimplexAdmin
              ? 'Click "+ Add website" to assign the first URL to this company.'
              : 'No websites have been assigned to this company yet.'
          }
        />
      ) : (
        <div className="space-y-3">
          {websites.map((website) => (
            <AdminWebsiteRow key={website.id} website={website} canManage={isSimplexAdmin} />
          ))}
        </div>
      )}

      {isSimplexAdmin ? (
        <AddWebsiteModal companyId={companyId} open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      ) : null}
    </div>
  );
}
