export const CLIENT_DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'orders', label: 'Orders & Payments' },
  { id: 'agent', label: 'Agent performance' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'websites', label: 'Websites' },
  { id: 'settings', label: 'Settings' },
] as const;

export type ClientDetailTabId = (typeof CLIENT_DETAIL_TABS)[number]['id'];

export function parseClientDetailTab(tab: string | null): ClientDetailTabId {
  const found = CLIENT_DETAIL_TABS.find((t) => t.id === tab);
  return found ? found.id : 'overview';
}
