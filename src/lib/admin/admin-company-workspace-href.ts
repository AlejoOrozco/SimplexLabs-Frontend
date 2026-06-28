/** Canonical admin URL for a company workspace (`/admin/companies/...`). */
export const ADMIN_COMPANY_WORKSPACE_PATH = '/admin/companies';

export function adminCompanyWorkspaceHref(companyId: string, tab?: string): string {
  const base = `${ADMIN_COMPANY_WORKSPACE_PATH}/${encodeURIComponent(companyId)}`;
  if (!tab) return base;
  return `${base}?tab=${encodeURIComponent(tab)}`;
}

/** Deep link into a section of the company Manage tab. */
export function adminCompanyManageSectionHref(companyId: string, section: CompanyManageSectionId): string {
  return `${adminCompanyWorkspaceHref(companyId, 'manage')}&section=${encodeURIComponent(section)}`;
}

export type CompanyManageSectionId =
  | 'overview'
  | 'subscriptions'
  | 'websites'
  | 'users'
  | 'profile'
  | 'agent'
  | 'knowledge-base'
  | 'billing';

export function adminCompanyConversationHref(companyId: string, conversationId: string): string {
  return `${ADMIN_COMPANY_WORKSPACE_PATH}/${encodeURIComponent(companyId)}/conversations/${encodeURIComponent(conversationId)}`;
}
