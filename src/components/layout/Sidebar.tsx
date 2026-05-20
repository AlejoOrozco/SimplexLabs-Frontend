'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SimplexLogo } from '@/components/branding/simplex-logo';
import { getNavSections } from '@/components/layout/nav-config';
import { SidebarSessionFooter } from '@/components/layout/sidebar-session-footer';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isAdmin: boolean;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  session: {
    userName: string;
    userEmail: string | null;
    companyName: string | null;
    subscriptionPlan: string | null;
  };
}

export function Sidebar({
  isAdmin,
  isCollapsed,
  onToggleCollapsed,
  session,
}: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const { primary, admin } = getNavSections(isAdmin);
  const width = isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  const renderNavItem = (item: (typeof primary)[number]): JSX.Element => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        data-tour={item.tourTarget}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'group relative flex items-center rounded-md border-l-2 px-3 py-1.5 transition-colors',
          isCollapsed ? 'justify-center' : 'gap-2.5',
          isActive
            ? 'border-l-brand bg-surface-raised text-text-brand shadow-brand'
            : 'border-l-transparent text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
        )}
      >
        <Icon size={16} aria-hidden />
        {!isCollapsed ? <span>{item.label}</span> : null}
        {isCollapsed ? (
          <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-overlay px-2 py-1 text-[11px] text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            {item.label}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside aria-label="Primary" className="h-full self-stretch">
      <motion.div
        className="relative flex h-full shrink-0 flex-col border-r border-border-default bg-surface-base p-3 text-xs leading-snug"
        animate={{ width }}
        transition={{ type: 'spring', stiffness: 240, damping: 26, mass: 0.7 }}
      >
      <div
        className={cn(
          'mb-3 flex items-center rounded-md border border-border-default bg-surface-raised px-2 py-1',
          isCollapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <SimplexLogo
          size={isCollapsed ? 24 : 28}
          decorative={!isCollapsed}
          className="rounded-md"
          priority
        />
        {!isCollapsed ? <span className="font-semibold leading-none text-text-primary">SimplexLabs</span> : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1">{primary.map(renderNavItem)}</nav>

      {admin.length > 0 ? (
        <div className="mb-3 mt-3 border-t border-border-default pt-3">
          {!isCollapsed ? (
            <div className="mb-2 px-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">Admin</p>
            </div>
          ) : null}
          <nav className="flex flex-col gap-1">{admin.map(renderNavItem)}</nav>
        </div>
      ) : null}

      <div className="mt-auto flex shrink-0 flex-col gap-2">
        <SidebarSessionFooter
          isCollapsed={isCollapsed}
          userName={session.userName}
          userEmail={session.userEmail}
          companyName={session.companyName}
          subscriptionPlan={session.subscriptionPlan}
        />

        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center rounded-md border border-border-default bg-surface-raised text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary',
            isCollapsed ? 'justify-center' : 'justify-between px-3',
          )}
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} aria-hidden /> : <ChevronLeft size={16} aria-hidden />}
          {!isCollapsed ? <span>Collapse</span> : null}
        </button>
      </div>
      </motion.div>
    </aside>
  );
}
