import Link from 'next/link';
import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  showAdminNav?: boolean;
}

const clientNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/staff', label: 'Staff' },
  { href: '/orders', label: 'Orders' },
  { href: '/payments', label: 'Payments' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings/agent/profile', label: 'Agent Settings' },
];

const adminNav = [
  { href: '/failed-tasks', label: 'Failed tasks' },
  { href: '/companies', label: 'Companies' },
  { href: '/health', label: 'Health' },
];

export function AppShell({ children, showAdminNav = false }: AppShellProps): JSX.Element {
  const nav = showAdminNav ? [...clientNav, ...adminNav] : clientNav;
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-64 rounded-xl border bg-white p-4">
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link className="block rounded px-3 py-2 text-sm hover:bg-slate-100" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 rounded-xl border bg-white p-4">{children}</main>
      </div>
    </div>
  );
}
