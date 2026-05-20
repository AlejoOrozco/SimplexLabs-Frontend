'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageMeta } from '@/components/layout/page-meta';
import { Button } from '@/components/ui/button';
import { EditCompanyModal } from '@/components/companies/EditCompanyModal';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { useCompany } from '@/lib/hooks/use-companies';
import {
  COMPANY_WORKSPACE_TABS,
  parseCompanyWorkspaceTab,
  type CompanyWorkspaceTabId,
} from '@/components/admin/client-detail/client-detail-tabs';
import { OverviewTab } from '@/components/admin/client-detail/tabs/overview-tab';
import { ConversationsTab } from '@/components/admin/client-detail/tabs/conversations-tab';
import { OrdersPaymentsTab } from '@/components/admin/client-detail/tabs/orders-payments-tab';
import { AgentPerformanceTab } from '@/components/admin/client-detail/tabs/agent-performance-tab';
import { AppointmentsTab } from '@/components/admin/client-detail/tabs/appointments-tab';
import { WebsitesTab } from '@/components/admin/client-detail/tabs/websites-tab';
import { CompanyTeamTab } from '@/components/admin/client-detail/tabs/company-team-tab';
import { SettingsTab } from '@/components/admin/client-detail/tabs/settings-tab';

interface AdminCompanyWorkspaceShellProps {
  companyId: string;
}

export function AdminCompanyWorkspaceShell({ companyId }: AdminCompanyWorkspaceShellProps): JSX.Element {
  const searchParams = useSearchParams();
  const tab = parseCompanyWorkspaceTab(searchParams.get('tab'));
  const companyQuery = useCompany(companyId);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  if (companyQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading company…</p>;
  }
  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-surface p-4">
        <p className="font-medium text-error-dark">Company not found or inaccessible.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-text-brand underline">
          Back to platform overview
        </Link>
      </div>
    );
  }

  const company = companyQuery.data;

  return (
    <div className="space-y-6">
      <PageMeta
        title={company.name}
        description="Deep tenant view: most tabs are read-only; use Settings to edit company data and account status on behalf of the company."
      />
      <div className="flex flex-wrap items-center justify-end gap-4">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditCompanyOpen(true)}>
          Edit
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border-default pb-2">
        {COMPANY_WORKSPACE_TABS.map((t) => {
          const active = t.id === tab;
          const href = adminCompanyWorkspaceHref(companyId, t.id);
          return (
            <Link
              key={t.id}
              href={href}
              scroll={false}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-surface-raised text-text-brand shadow-brand'
                  : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[240px]">
        <TabPanel tab={tab} companyId={companyId} />
      </div>

      <EditCompanyModal company={company} open={editCompanyOpen} onClose={() => setEditCompanyOpen(false)} />
    </div>
  );
}

function TabPanel({ tab, companyId }: { tab: CompanyWorkspaceTabId; companyId: string }): JSX.Element {
  switch (tab) {
    case 'overview':
      return <OverviewTab companyId={companyId} />;
    case 'conversations':
      return <ConversationsTab companyId={companyId} />;
    case 'orders':
      return <OrdersPaymentsTab companyId={companyId} />;
    case 'agent':
      return <AgentPerformanceTab companyId={companyId} />;
    case 'appointments':
      return <AppointmentsTab companyId={companyId} />;
    case 'websites':
      return <WebsitesTab companyId={companyId} />;
    case 'team':
      return <CompanyTeamTab companyId={companyId} />;
    case 'settings':
      return <SettingsTab companyId={companyId} />;
  }
}
