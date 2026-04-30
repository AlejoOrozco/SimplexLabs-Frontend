'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { getNavSections } from '@/components/layout/nav-config';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isAdmin: boolean;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ isAdmin, isCollapsed, onToggleCollapsed }: SidebarProps): JSX.Element {
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
    <motion.aside
      aria-label="Primary"
      className="relative flex h-screen shrink-0 flex-col border-r border-border-default bg-surface-page p-3"
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
          {!isCollapsed ? <p className="mb-2 px-3 text-xs font-medium text-text-secondary">Admin</p> : null}
          <nav className="flex flex-col gap-1">{admin.map(renderNavItem)}</nav>
        </div>
      ) : null}

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
    </motion.aside>
  );
}
