/** Canonical admin URL for a company workspace (`/admin/companies/...`). */
export const ADMIN_COMPANY_WORKSPACE_PATH = '/admin/companies';

export function adminCompanyWorkspaceHref(companyId: string, tab?: string): string {
  const base = `${ADMIN_COMPANY_WORKSPACE_PATH}/${encodeURIComponent(companyId)}`;
  if (!tab) return base;
  return `${base}?tab=${encodeURIComponent(tab)}`;
}

export function adminCompanyConversationHref(companyId: string, conversationId: string): string {
  return `${ADMIN_COMPANY_WORKSPACE_PATH}/${encodeURIComponent(companyId)}/conversations/${encodeURIComponent(conversationId)}`;
}
