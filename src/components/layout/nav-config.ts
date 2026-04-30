import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Building2,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  Settings2,
  ShoppingCart,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
}

export interface NavSections {
  primary: NavItem[];
  admin: NavItem[];
}

const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/inbox', label: 'Inbox', icon: Inbox, adminOnly: false },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays, adminOnly: false },
  { href: '/staff', label: 'Staff', icon: Users, adminOnly: false },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, adminOnly: false },
  { href: '/payments', label: 'Payments', icon: Wallet, adminOnly: false },
  { href: '/settings/agent/profile', label: 'Agent Settings', icon: Settings2, adminOnly: false },
  { href: '/failed-tasks', label: 'Failed Tasks', icon: XCircle, adminOnly: false },
] as const;

const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { href: '/companies', label: 'Companies', icon: Building2, adminOnly: true },
  { href: '/health', label: 'Health', icon: Activity, adminOnly: true },
] as const;

export function getNavSections(isAdmin: boolean): NavSections {
  return {
    primary: [...PRIMARY_NAV_ITEMS],
    admin: isAdmin ? [...ADMIN_NAV_ITEMS] : [],
  };
}
