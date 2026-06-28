'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Bot, CreditCard, Globe, LayoutGrid, Users } from 'lucide-react';
import { SetupGapChips } from '@/components/admin/manage/company/setup-gap-chips';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/shared/Skeleton';
import { adminCompanyManageSectionHref } from '@/lib/admin/admin-company-workspace-href';
import { adminPlanCategoryLabel } from '@/lib/admin/admin-hub-utils';
import type { AdminManageSummary } from '@/lib/types/admin-hub';
import {
  formatCurrency,
  formatDate,
  fullName,
  nicheLabel,
  subStatusLabel,
} from '@/lib/utils/format';

interface ManageSummaryLandingProps {
  companyId: string;
  summary: AdminManageSummary;
}

interface SummaryStatCardProps {
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: ReactNode;
}

function SummaryStatCard({ label, value, hint, href, icon }: SummaryStatCardProps): JSX.Element {
  return (
    <Link
      href={href}
      scroll={false}
      className="group rounded-lg border border-border-default bg-surface-base p-4 transition-colors hover:border-border-brand hover:bg-surface-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}
        </div>
        <div className="rounded-md border border-border-default bg-surface-overlay p-2 text-text-secondary transition-colors group-hover:text-text-brand">
          {icon}
        </div>
      </div>
    </Link>
  );
}

export function ManageSummaryLanding({ companyId, summary }: ManageSummaryLandingProps): JSX.Element {
  const { company, subscriptions, websites, users, agentConfig, knowledgeBase, setupGaps } = summary;
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE' || s.status === 'PAUSED');

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border-default bg-surface-base p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{company.name}</h3>
          <p className="mt-1 text-sm text-text-secondary">{nicheLabel(company.niche)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={company.isActive ? 'success' : 'neutral'}>
              {company.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {company.isPlatformOwner ? <Badge variant="info">Platform owner</Badge> : null}
          </div>
        </div>

        {setupGaps.length > 0 ? (
          <div className="mt-4 border-t border-border-default pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
              Setup gaps
            </p>
            <SetupGapChips companyId={companyId} gaps={setupGaps} />
          </div>
        ) : (
          <p className="mt-4 border-t border-border-default pt-4 text-sm text-success">
            Core setup looks complete for this tenant.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard
          label="Subscriptions"
          value={String(activeSubscriptions.length)}
          hint={`${subscriptions.length} total on file`}
          href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
          icon={<CreditCard className="h-4 w-4" aria-hidden />}
        />
        <SummaryStatCard
          label="Websites"
          value={String(websites.count)}
          hint={websites.count === 1 ? '1 URL assigned' : `${websites.count} URLs assigned`}
          href={adminCompanyManageSectionHref(companyId, 'websites')}
          icon={<Globe className="h-4 w-4" aria-hidden />}
        />
        <SummaryStatCard
          label="Users"
          value={String(users.count)}
          hint={
            users.primaryAdmin
              ? `Primary: ${fullName(users.primaryAdmin)}`
              : 'No primary admin yet'
          }
          href={adminCompanyManageSectionHref(companyId, 'users')}
          icon={<Users className="h-4 w-4" aria-hidden />}
        />
        <SummaryStatCard
          label="Knowledge base"
          value={String(knowledgeBase.activeCount)}
          hint={`${knowledgeBase.entryCount} entries total`}
          href={adminCompanyManageSectionHref(companyId, 'knowledge-base')}
          icon={<LayoutGrid className="h-4 w-4" aria-hidden />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border-default bg-surface-base p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-text-primary">Active plans</h4>
            <Link
              href={adminCompanyManageSectionHref(companyId, 'subscriptions')}
              scroll={false}
              className="text-xs font-medium text-text-brand hover:underline"
            >
              Manage subscriptions
            </Link>
          </div>
          {subscriptions.length === 0 ? (
            <p className="mt-3 text-sm text-text-secondary">No subscriptions assigned yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {subscriptions.map((subscription) => (
                <li
                  key={subscription.id}
                  className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">
                      {subscription.plan?.name ?? 'Unknown plan'}
                    </span>
                    <Badge variant="neutral">{subStatusLabel(subscription.status)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {subscription.plan?.category
                      ? adminPlanCategoryLabel(subscription.plan.category)
                      : 'Uncategorized'}{' '}
                    · {subscription.billingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}
                    {subscription.plan ? ` · ${formatCurrency(subscription.plan.priceMonthly)}/mo` : null}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Started {formatDate(subscription.startedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border-default bg-surface-base p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-text-primary">Agent &amp; websites</h4>
            <Link
              href={adminCompanyManageSectionHref(companyId, 'agent')}
              scroll={false}
              className="text-xs font-medium text-text-brand hover:underline"
            >
              Agent config
            </Link>
          </div>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
              <div>
                <dt className="text-text-secondary">Agent configuration</dt>
                <dd className="font-medium text-text-primary">
                  {agentConfig ? agentConfig.name : 'Not configured'}
                </dd>
                {agentConfig ? (
                  <dd className="mt-0.5 text-xs text-text-secondary">
                    {agentConfig.channels.length} channel
                    {agentConfig.channels.length === 1 ? '' : 's'} ·{' '}
                    {agentConfig.isActive ? 'Active' : 'Inactive'}
                  </dd>
                ) : null}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
              <div>
                <dt className="text-text-secondary">Websites</dt>
                <dd className="font-medium text-text-primary">
                  {websites.count === 0
                    ? 'None assigned'
                    : `${websites.count} URL${websites.count === 1 ? '' : 's'}`}
                </dd>
                {websites.items.length > 0 ? (
                  <dd className="mt-1 space-y-1">
                    {websites.items.slice(0, 3).map((site) => (
                      <p key={site.id} className="truncate text-xs text-text-secondary">
                        {site.label ?? site.url}
                      </p>
                    ))}
                  </dd>
                ) : null}
              </div>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export function ManageSummaryLandingSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border-default bg-surface-base p-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="rounded-lg border border-border-default bg-surface-base p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
