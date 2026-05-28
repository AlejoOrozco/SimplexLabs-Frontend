import type { ConversationListItem } from '@/lib/api/endpoints';

export interface AgentPerformanceSnapshot {
  totalConversations: number;
  closedConversations: number;
  agentSuccessRatePercent: number | null;
  lifecycleBreakdown: { label: string; count: number }[];
}

function isClosedConversation(lifecycleStatus: string): boolean {
  const normalized = lifecycleStatus.toUpperCase();
  return normalized.includes('CLOSED') || normalized.includes('RESOLVED') || normalized === 'DONE';
}

function conversationStatusLabel(conversation: ConversationListItem): string {
  return conversation.status ?? conversation.lifecycleStatus ?? 'unknown';
}

export function buildAgentPerformanceSnapshot(
  conversations: ConversationListItem[],
): AgentPerformanceSnapshot {
  const totalConversations = conversations.length;
  const closedConversations = conversations.filter((c) =>
    isClosedConversation(conversationStatusLabel(c)),
  ).length;
  const agentSuccessRatePercent =
    totalConversations > 0 ? Math.round((closedConversations / totalConversations) * 100) : null;

  const bucket = new Map<string, number>();
  for (const c of conversations) {
    const key = conversationStatusLabel(c);
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  const lifecycleBreakdown = [...bucket.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalConversations,
    closedConversations,
    agentSuccessRatePercent,
    lifecycleBreakdown,
  };
}
