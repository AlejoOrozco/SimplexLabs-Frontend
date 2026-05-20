'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight, FlaskConical, Plus } from 'lucide-react';
import { getNavSections } from '@/components/layout/nav-config';
import { SidebarSessionFooter } from '@/components/layout/sidebar-session-footer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
          'group relative flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors',
          isCollapsed ? 'justify-center' : 'gap-2.5',
          isActive
            ? 'border-l-brand-500 bg-brand-50 text-text-brand'
            : 'border-l-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary',
        )}
      >
        <Icon size={18} aria-hidden />
        {!isCollapsed ? <span>{item.label}</span> : null}
        {isCollapsed ? (
          <span className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 rounded-md border border-border-default bg-surface-page px-2 py-1 text-xs text-text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            {item.label}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside aria-label="Primary" className="h-full self-stretch">
      <motion.div
        className="relative flex h-full shrink-0 flex-col border-r border-border-default bg-surface-page p-3"
        animate={{ width }}
        transition={{ type: 'spring', stiffness: 240, damping: 26, mass: 0.7 }}
      >
      <div
        className={cn(
          'mb-4 flex h-10 items-center rounded-md border border-border-default bg-surface-raised px-2',
          isCollapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <FlaskConical size={18} className="text-brand-600" aria-hidden />
        {!isCollapsed ? <span className="text-sm font-semibold text-text-primary">SimplexLabs</span> : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1">{primary.map(renderNavItem)}</nav>

      {admin.length > 0 ? (
        <div className="mb-3 mt-3 border-t border-border-default pt-3">
          {!isCollapsed ? (
            <div className="mb-2 flex items-center justify-between gap-2 px-3">
              <p className="text-xs font-medium text-text-secondary">Admin</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs">
                    Create
                    <ChevronDown className="size-3 opacity-70" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/onboarding">New user</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/companies/create">New company</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="mb-2 flex justify-center px-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                    title="Create"
                    aria-label="Create menu"
                  >
                    <Plus size={16} aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="min-w-[10rem]">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/onboarding">New user</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/companies/create">New company</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <nav className="flex flex-col gap-1">{admin.map(renderNavItem)}</nav>
        </div>
      ) : null}

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
          'mt-auto inline-flex h-10 items-center rounded-md border border-border-default bg-surface-raised text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary',
          isCollapsed ? 'justify-center' : 'justify-between px-3',
        )}
        onClick={onToggleCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} aria-hidden /> : <ChevronLeft size={16} aria-hidden />}
        {!isCollapsed ? <span className="text-sm">Collapse</span> : null}
      </button>
      </motion.div>
    </aside>
  );
}
