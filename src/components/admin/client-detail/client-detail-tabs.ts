export const COMPANY_WORKSPACE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'orders', label: 'Orders & Payments' },
  { id: 'agent', label: 'Agent performance' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'websites', label: 'Websites' },
  { id: 'team', label: 'Team' },
  { id: 'settings', label: 'Settings' },
] as const;

export type CompanyWorkspaceTabId = (typeof COMPANY_WORKSPACE_TABS)[number]['id'];

export function parseCompanyWorkspaceTab(tab: string | null): CompanyWorkspaceTabId {
  const found = COMPANY_WORKSPACE_TABS.find((t) => t.id === tab);
  return found ? found.id : 'overview';
}
