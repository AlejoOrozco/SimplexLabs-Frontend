'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItems } from '@/components/layout/nav-config';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isAdmin: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const items = getNavItems(isAdmin);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r p-4" aria-label="Primary">
      <div className="mb-4 text-sm font-semibold">SimplexLabs</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
