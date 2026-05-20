import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  CreditCard,
  Globe,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Settings2,
  ShoppingCart,
  UserCircle,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
  /** `data-tour` value for the client onboarding Joyride (sidebar targets). */
  tourTarget?: string;
}

export interface NavSections {
  primary: NavItem[];
  admin: NavItem[];
}

const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/inbox', label: 'Inbox', icon: Inbox, adminOnly: false, tourTarget: 'sidebar-inbox' },
  {
    href: '/appointments',
    label: 'Appointments',
    icon: CalendarDays,
    adminOnly: false,
    tourTarget: 'sidebar-appointments',
  },
  { href: '/staff', label: 'Staff', icon: Users, adminOnly: false },
  { href: '/websites', label: 'Websites', icon: Globe, adminOnly: false },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, adminOnly: false, tourTarget: 'sidebar-orders' },
  { href: '/payments', label: 'Payments', icon: Wallet, adminOnly: false },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard, adminOnly: false },
  {
    href: '/settings/agent/profile',
    label: 'Agent Settings',
    icon: Settings2,
    adminOnly: false,
    tourTarget: 'sidebar-agent-settings',
  },
] as const;

const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin', label: 'Platform', icon: LayoutGrid, adminOnly: true },
  { href: '/admin/clients', label: 'Clients', icon: Users, adminOnly: true },
  { href: '/admin/users', label: 'Users', icon: UserCircle, adminOnly: true },
  { href: '/admin/companies', label: 'Companies', icon: Building2, adminOnly: true },
  { href: '/admin/failed-tasks', label: 'Failed tasks', icon: XCircle, adminOnly: true },
] as const;

export function getNavSections(isAdmin: boolean): NavSections {
  return {
    primary: [...PRIMARY_NAV_ITEMS],
    admin: isAdmin ? [...ADMIN_NAV_ITEMS] : [],
  };
}
