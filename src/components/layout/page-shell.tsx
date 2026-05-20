'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { usePageMetaState } from '@/components/layout/page-meta';
import { cn } from '@/lib/utils/cn';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  inbox: 'Inbox',
  appointments: 'Appointments',
  staff: 'Staff',
  websites: 'Websites',
  orders: 'Orders',
  payments: 'Payments',
  notifications: 'Notifications',
  settings: 'Settings',
  billing: 'Billing',
  team: 'Team',
  company: 'Company',
  channels: 'Channels',
  agent: 'Agent',
  profile: 'Profile',
  'knowledge-base': 'Knowledge base',
  sandbox: 'Sandbox',
  prompts: 'Prompts',
  admin: 'Admin',
  users: 'Users',
  companies: 'Companies',
  clients: 'Clients',
  'failed-tasks': 'Failed tasks',
  onboarding: 'Onboarding',
  create: 'Create',
  permissions: 'Permissions',
  conversations: 'Conversations',
  health: 'Health',
  forbidden: 'Forbidden',
};

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function titleFromSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getBreadcrumbs(pathname: string): Array<{ href: string; label: string }> {
  const segments = pathname.split('/').filter((segment) => segment.length > 0 && !UUID_SEGMENT.test(segment));
  return segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join('/')}`,
    label: titleFromSegment(segment),
  }));
}

export function PageShell({ children, className }: PageShellProps): JSX.Element {
  const pathname = usePathname();
  const { meta } = usePageMetaState();
  const breadcrumbs = getBreadcrumbs(pathname);
  const fallbackTitle = breadcrumbs.at(-1)?.label ?? 'Dashboard';
  const resolvedTitle = meta.title ?? fallbackTitle;
  const resolvedDescription = meta.description;

  return (
    <section className={cn('flex h-full min-h-0 flex-col', className)}>
      <header className="border-b border-border-default px-8 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-text-secondary">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="inline-flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              <span>{crumb.label}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-semibold text-text-primary">{resolvedTitle}</h1>
        {resolvedDescription ? <p className="mt-2 text-sm text-text-secondary">{resolvedDescription}</p> : null}
      </header>
      <div className="min-h-0 flex-1 px-8 py-6">{children}</div>
    </section>
  );
}
