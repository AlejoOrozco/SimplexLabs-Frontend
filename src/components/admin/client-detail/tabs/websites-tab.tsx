'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { AddWebsiteModal } from '@/components/websites/AddWebsiteModal';
import { AdminWebsiteRow } from '@/components/websites/AdminWebsiteRow';
import { useAdminCompanyWebsites } from '@/lib/hooks/use-admin-company-websites';
import { useSubscriptions } from '@/lib/hooks/use-subscriptions';
import { companyHasActiveWebsitePlan } from '@/lib/websites/company-has-active-website-plan';

interface WebsitesTabProps {
  companyId: string;
}

export function WebsitesTab({ companyId }: WebsitesTabProps): JSX.Element {
  const subscriptionsQuery = useSubscriptions();
  const websitesQuery = useAdminCompanyWebsites(companyId);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const hasWebsitePlan = companyHasActiveWebsitePlan(companyId, subscriptionsQuery.data);
  const websites = websitesQuery.data ?? [];

  if (websitesQuery.isLoading || subscriptionsQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading websites…</p>;
  }

  if (!hasWebsitePlan) {
    return (
      <div className="rounded-lg border border-warning bg-warning-light px-4 py-3 text-sm text-warning-dark">
        This company does not have an active Website plan. Assign a Website plan before adding URLs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">Assigned websites ({websites.length})</h3>
        <Button type="button" size="sm" onClick={() => setAddModalOpen(true)}>
          + Add website
        </Button>
      </div>

      {websites.length === 0 ? (
        <EmptyState
          title="No websites yet"
          description="Add the first website URL for this company."
        />
      ) : (
        <div className="space-y-3">
          {websites.map((website) => (
            <AdminWebsiteRow key={website.id} website={website} />
          ))}
        </div>
      )}

      <AddWebsiteModal companyId={companyId} open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
