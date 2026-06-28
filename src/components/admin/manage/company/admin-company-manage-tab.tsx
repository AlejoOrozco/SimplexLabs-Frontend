'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  COMPANY_MANAGE_SECTIONS,
  parseCompanyManageSection,
} from '@/components/admin/manage/company/company-manage-sections';
import { ManageAgentConfigSection } from '@/components/admin/manage/company/manage-agent-config-section';
import { ManageBillingSection } from '@/components/admin/manage/company/manage-billing-section';
import { ManageCompanyProfileSection } from '@/components/admin/manage/company/manage-company-profile-section';
import { ManageKnowledgeBaseSection } from '@/components/admin/manage/company/manage-knowledge-base-section';
import { ManageSubscriptionsSection } from '@/components/admin/manage/company/manage-subscriptions-section';
import { ManageUsersSection } from '@/components/admin/manage/company/manage-users-section';
import { ManageWebsitesSection } from '@/components/admin/manage/company/manage-websites-section';
import {
  ManageSummaryLanding,
  ManageSummaryLandingSkeleton,
} from '@/components/admin/manage/company/manage-summary-landing';
import { useAdminManageSummary } from '@/lib/hooks/use-admin-manage-summary';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { cn } from '@/lib/utils/cn';

interface AdminCompanyManageTabProps {
  companyId: string;
  companyIsInactive?: boolean;
}

export function AdminCompanyManageTab({
  companyId,
  companyIsInactive = false,
}: AdminCompanyManageTabProps): JSX.Element {
  const searchParams = useSearchParams();
  const section = parseCompanyManageSection(searchParams.get('section'));
  const summaryQuery = useAdminManageSummary(companyId);

  return (
    <div className="space-y-4">
      {companyIsInactive ? (
        <p className="rounded-lg border border-warning bg-warning-surface px-4 py-3 text-sm text-warning-dark">
          This company is inactive. Some manage actions may be disabled until the company is reactivated.
        </p>
      ) : null}

      <ManageSubNav companyId={companyId} activeSection={section} />

      <ManageSectionPanel
        section={section}
        companyId={companyId}
        companyIsInactive={companyIsInactive}
        summaryQuery={summaryQuery}
      />
    </div>
  );
}

function ManageSectionPanel({
  section,
  companyId,
  companyIsInactive,
  summaryQuery,
}: {
  section: (typeof COMPANY_MANAGE_SECTIONS)[number]['id'];
  companyId: string;
  companyIsInactive: boolean;
  summaryQuery: ReturnType<typeof useAdminManageSummary>;
}): JSX.Element {
  if (section === 'subscriptions') {
    return (
      <ManageSubscriptionsSection companyId={companyId} companyIsInactive={companyIsInactive} />
    );
  }

  if (section === 'profile') {
    return (
      <ManageCompanyProfileSection companyId={companyId} companyIsInactive={companyIsInactive} />
    );
  }

  if (section === 'websites') {
    return (
      <ManageWebsitesSection companyId={companyId} companyIsInactive={companyIsInactive} />
    );
  }

  if (section === 'users') {
    return <ManageUsersSection companyId={companyId} companyIsInactive={companyIsInactive} />;
  }

  if (section === 'agent') {
    return <ManageAgentConfigSection companyId={companyId} companyIsInactive={companyIsInactive} />;
  }

  if (section === 'knowledge-base') {
    return (
      <ManageKnowledgeBaseSection companyId={companyId} companyIsInactive={companyIsInactive} />
    );
  }

  if (section === 'billing') {
    return <ManageBillingSection companyId={companyId} companyIsInactive={companyIsInactive} />;
  }

  if (section === 'overview') {
    if (summaryQuery.isLoading) return <ManageSummaryLandingSkeleton />;
    if (summaryQuery.isError || !summaryQuery.data) {
      return (
        <div className="rounded-lg border border-error bg-error-surface p-4 text-sm text-error-dark">
          Could not load manage summary for this company. Check your platform admin access and try again.
        </div>
      );
    }
    return <ManageSummaryLanding companyId={companyId} summary={summaryQuery.data} />;
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-base p-4 text-sm text-text-secondary">
      Unknown manage section.
    </div>
  );
}

function ManageSubNav({
  companyId,
  activeSection,
}: {
  companyId: string;
  activeSection: (typeof COMPANY_MANAGE_SECTIONS)[number]['id'];
}): JSX.Element {
  return (
    <nav
      aria-label="Manage sections"
      className="flex flex-wrap gap-1 rounded-lg border border-border-default bg-surface-base p-1"
    >
      {COMPANY_MANAGE_SECTIONS.map((item) => {
        const active = item.id === activeSection;
        return (
          <Link
            key={item.id}
            href={adminCompanyManageSectionHref(companyId, item.id)}
            scroll={false}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-surface-raised text-text-brand shadow-brand'
                : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
