'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditCompanyModal } from '@/components/companies/EditCompanyModal';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useCompany } from '@/lib/hooks/use-companies';
import {
  CLIENT_DETAIL_TABS,
  parseClientDetailTab,
  type ClientDetailTabId,
} from '@/components/admin/client-detail/client-detail-tabs';
import { OverviewTab } from '@/components/admin/client-detail/tabs/overview-tab';
import { ConversationsTab } from '@/components/admin/client-detail/tabs/conversations-tab';
import { OrdersPaymentsTab } from '@/components/admin/client-detail/tabs/orders-payments-tab';
import { AgentPerformanceTab } from '@/components/admin/client-detail/tabs/agent-performance-tab';
import { AppointmentsTab } from '@/components/admin/client-detail/tabs/appointments-tab';
import { WebsitesTab } from '@/components/admin/client-detail/tabs/websites-tab';
import { SettingsTab } from '@/components/admin/client-detail/tabs/settings-tab';

interface AdminClientDetailShellProps {
  companyId: string;
}

export function AdminClientDetailShell({ companyId }: AdminClientDetailShellProps): JSX.Element {
  const searchParams = useSearchParams();
  const tab = parseClientDetailTab(searchParams.get('tab'));
  const companyQuery = useCompany(companyId);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);

  if (companyQuery.isLoading) {
    return <p className="text-sm text-text-secondary">Loading client…</p>;
  }
  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="rounded-lg border border-error bg-error-light p-4">
        <p className="font-medium text-error-dark">Client not found or inaccessible.</p>
        <Link href="/admin" className="mt-2 inline-block text-sm text-text-brand underline">
          Back to platform overview
        </Link>
      </div>
    );
  }

  const company = companyQuery.data;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/admin" className="text-text-brand hover:underline">
          Platform
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-text-primary">{company.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{company.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Deep tenant view: most tabs are read-only; use Settings to edit company data and account status on behalf of
            the client.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditCompanyOpen(true)}>
          Edit
        </Button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border-default pb-2">
        {CLIENT_DETAIL_TABS.map((t) => {
          const active = t.id === tab;
          const href = `/admin/clients/${companyId}?tab=${t.id}`;
          return (
            <Link
              key={t.id}
              href={href}
              scroll={false}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-text-brand'
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary',
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

function TabPanel({ tab, companyId }: { tab: ClientDetailTabId; companyId: string }): JSX.Element {
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
    case 'settings':
      return <SettingsTab companyId={companyId} />;
  }
}
