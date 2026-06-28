import type { CompanyManageSectionId } from '@/lib/admin/admin-company-workspace-href';

export const COMPANY_MANAGE_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'websites', label: 'Websites' },
  { id: 'users', label: 'Users' },
  { id: 'profile', label: 'Company profile' },
  { id: 'agent', label: 'Agent config' },
  { id: 'knowledge-base', label: 'Knowledge base' },
  { id: 'billing', label: 'Billing' },
] as const satisfies ReadonlyArray<{ id: CompanyManageSectionId; label: string }>;

export function parseCompanyManageSection(section: string | null): CompanyManageSectionId {
  const found = COMPANY_MANAGE_SECTIONS.find((s) => s.id === section);
  return found ? found.id : 'overview';
}
