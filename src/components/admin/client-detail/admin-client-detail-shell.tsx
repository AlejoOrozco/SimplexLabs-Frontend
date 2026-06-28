'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { PageMeta } from '@/components/layout/page-meta';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ApiClientError } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { adminCompanyManageSectionHref, adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { canDeactivateAdminCompany, canReactivateAdminCompany } from '@/lib/admin/company-lifecycle';
import { useAdminCompanyDetail, useReactivateAdminCompany } from '@/lib/hooks/use-admin-companies';
import { useCompany, useDeleteCompany } from '@/lib/hooks/use-companies';
import { queryKeys } from '@/lib/hooks/query-keys';
import { notify } from '@/lib/toast';
import { CompanyDeactivationInfoPanel } from '@/components/admin/client-detail/company-deactivation-info-panel';
import {
  COMPANY_WORKSPACE_TABS,
  parseCompanyWorkspaceTab,
  type CompanyWorkspaceTabId,
} from '@/components/admin/client-detail/client-detail-tabs';
import { AdminCompanyManageTab } from '@/components/admin/manage/company/admin-company-manage-tab';
import { OverviewTab } from '@/components/admin/client-detail/tabs/overview-tab';
import { ConversationsTab } from '@/components/admin/client-detail/tabs/conversations-tab';
import { OrdersPaymentsTab } from '@/components/admin/client-detail/tabs/orders-payments-tab';
import { AgentPerformanceTab } from '@/components/admin/client-detail/tabs/agent-performance-tab';
import { AppointmentsTab } from '@/components/admin/client-detail/tabs/appointments-tab';
import { WebsitesTab } from '@/components/admin/client-detail/tabs/websites-tab';
import { CompanyTeamTab } from '@/components/admin/client-detail/tabs/company-team-tab';

interface AdminCompanyWorkspaceShellProps {
  companyId: string;
}

export function AdminCompanyWorkspaceShell({ companyId }: AdminCompanyWorkspaceShellProps): JSX.Element {
  const qc = useQueryClient();
  const { isSimplexAdmin } = useAuth();
  const searchParams = useSearchParams();
  const tab = parseCompanyWorkspaceTab(searchParams.get('tab'));
  const companyQuery = useCompany(companyId);
  const adminDetailQuery = useAdminCompanyDetail(companyId);
  const deleteCompany = useDeleteCompany();
  const reactivateCompany = useReactivateAdminCompany();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);

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
  const adminDetail = adminDetailQuery.data;
  const companyIsInactive = adminDetail ? !adminDetail.isActive : false;
  const tenantActionsDisabled = companyIsInactive;
  const showDeactivateCompany =
    isSimplexAdmin && adminDetailQuery.isSuccess && adminDetail !== undefined && canDeactivateAdminCompany(adminDetail);
  const showReactivateCompany =
    isSimplexAdmin &&
    adminDetailQuery.isSuccess &&
    adminDetail !== undefined &&
    canReactivateAdminCompany(adminDetail);

  const handleDeleteCompany = async (): Promise<void> => {
    try {
      await deleteCompany.mutateAsync(companyId);
      notify.success('Company deactivated');
      setDeleteConfirmOpen(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        void qc.invalidateQueries({ queryKey: queryKeys.companies.all });
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.all });
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.detail(companyId) });
        void qc.invalidateQueries({ queryKey: queryKeys.users.all });
        notify.info('Already deleted or not found');
        setDeleteConfirmOpen(false);
        return;
      }
      notify.error('Could not deactivate company');
    }
  };

  const handleReactivateCompany = async (): Promise<void> => {
    try {
      const result = await reactivateCompany.mutateAsync(companyId);
      const usersLabel =
        result.usersReactivated === 1
          ? '1 user reactivated'
          : `${result.usersReactivated} users reactivated`;
      notify.success(
        result.usersReactivated > 0 ? `Company reactivated (${usersLabel})` : 'Company reactivated',
      );
      setReactivateConfirmOpen(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.all });
        void qc.invalidateQueries({ queryKey: queryKeys.admin.companies.detail(companyId) });
        void qc.invalidateQueries({ queryKey: queryKeys.users.all });
        notify.info('Company not found or already reactivated');
        setReactivateConfirmOpen(false);
        return;
      }
      notify.error('Could not reactivate company');
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta
        title={company.name}
        description="Deep tenant view: use Manage to edit plans, users, and integrations; other tabs are mostly read-only."
      />
      {adminDetail && companyIsInactive ? <CompanyDeactivationInfoPanel detail={adminDetail} /> : null}
      <div className="flex flex-wrap items-center justify-end gap-4">
        {isSimplexAdmin && !tenantActionsDisabled ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={adminCompanyManageSectionHref(companyId, 'profile')} scroll={false}>
              Edit profile
            </Link>
          </Button>
        ) : isSimplexAdmin ? (
          <Button type="button" variant="outline" size="sm" disabled>
            Edit profile
          </Button>
        ) : null}
        {showReactivateCompany ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setReactivateConfirmOpen(true)}
            disabled={reactivateCompany.isPending}
          >
            Reactivate company
          </Button>
        ) : null}
        {showDeactivateCompany ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={deleteCompany.isPending}
          >
            Deactivate company
          </Button>
        ) : null}
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
        <TabPanel tab={tab} companyId={companyId} companyIsInactive={tenantActionsDisabled} />
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Deactivate company"
        description="This will deactivate the company and all its active users."
        confirmLabel="Deactivate company"
        variant="destructive"
        onConfirm={handleDeleteCompany}
        isLoading={deleteCompany.isPending}
      />
      <ConfirmDialog
        open={reactivateConfirmOpen}
        onOpenChange={setReactivateConfirmOpen}
        title="Reactivate company"
        description="This will reactivate the company and all inactive users for this tenant."
        confirmLabel="Reactivate company"
        onConfirm={handleReactivateCompany}
        isLoading={reactivateCompany.isPending}
      />
    </div>
  );
}

function TabPanel({
  tab,
  companyId,
  companyIsInactive,
}: {
  tab: CompanyWorkspaceTabId;
  companyId: string;
  companyIsInactive: boolean;
}): JSX.Element {
  switch (tab) {
    case 'overview':
      return <OverviewTab companyId={companyId} />;
    case 'manage':
      return <AdminCompanyManageTab companyId={companyId} companyIsInactive={companyIsInactive} />;
    case 'conversations':
      return <ConversationsTab companyId={companyId} />;
    case 'orders':
      return <OrdersPaymentsTab companyId={companyId} />;
    case 'agent':
      return <AgentPerformanceTab companyId={companyId} />;
    case 'appointments':
      return <AppointmentsTab companyId={companyId} />;
    case 'websites':
      return <WebsitesTab companyId={companyId} companyIsInactive={companyIsInactive} />;
    case 'team':
      return <CompanyTeamTab companyId={companyId} companyIsInactive={companyIsInactive} />;
  }
}
