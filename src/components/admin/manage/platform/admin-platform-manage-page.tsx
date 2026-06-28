'use client';

import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { PlanCatalogSection } from '@/components/admin/manage/platform/plan-catalog-section';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { useAdminCompanies } from '@/lib/hooks/use-admin-companies';
import { fullName } from '@/lib/utils/format';

export function AdminPlatformManagePage(): JSX.Element {
  const companiesQuery = useAdminCompanies();
  const recentCompanies = (companiesQuery.data ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border-default bg-surface-base p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Company workspaces</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Tenant-specific subscriptions, users, agent config, and billing live in each company
              workspace under the Manage tab.
            </p>
          </div>
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1 text-sm font-medium text-text-brand hover:underline"
          >
            View all companies
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {companiesQuery.isLoading ? (
          <p className="mt-4 text-sm text-text-secondary">Loading companies…</p>
        ) : recentCompanies.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">No companies registered yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-default rounded-md border border-border-default">
            {recentCompanies.map((company) => (
              <li key={company.id}>
                <Link
                  href={adminCompanyWorkspaceHref(company.id, 'manage')}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary">{company.name}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {company.primaryAdmin
                        ? `${fullName(company.primaryAdmin)} · ${company.primaryAdmin.email}`
                        : 'No primary admin'}
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PlanCatalogSection />
    </div>
  );
}
