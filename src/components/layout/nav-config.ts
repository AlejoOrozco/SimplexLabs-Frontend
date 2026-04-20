export interface NavItem {
  href: string;
  label: string;
  adminOnly: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: false },
  { href: '/dashboard/appointments', label: 'Appointments', adminOnly: false },
  { href: '/dashboard/conversations', label: 'Conversations', adminOnly: false },
  { href: '/dashboard/orders', label: 'Orders', adminOnly: false },
  { href: '/dashboard/products', label: 'Products', adminOnly: false },
  { href: '/dashboard/websites', label: 'Websites', adminOnly: false },
  { href: '/dashboard/contacts', label: 'Contacts', adminOnly: false },
  { href: '/dashboard/companies', label: 'Companies', adminOnly: true },
  { href: '/dashboard/users', label: 'Users', adminOnly: true },
  { href: '/dashboard/plans', label: 'Plans', adminOnly: true },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', adminOnly: true },
] as const;

export function getNavItems(isAdmin: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => (item.adminOnly ? isAdmin : true));
}
