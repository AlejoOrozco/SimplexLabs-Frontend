import type { ConversationListItem, ConversationDetail } from '@/features/conversations/types';
import { channelLabel } from '@/lib/utils/format';

type ConversationWithStatus = ConversationListItem | ConversationDetail;

export function getConversationStatusLabel(conversation: ConversationWithStatus): string {
  if (conversation.status) return conversation.status;
  if (conversation.lifecycleStatus) return conversation.lifecycleStatus;
  return 'OPEN';
}

export function getContactDisplayName(conversation: ConversationWithStatus): string {
  const name = `${conversation.contact.firstName} ${conversation.contact.lastName}`.trim();
  if (name) return name;
  return conversation.contact.phone ?? 'Unknown contact';
}

export function getConversationChannelLabel(channel: ConversationWithStatus['channel']): string {
  return channelLabel(channel);
}

export function truncatePreview(content: string, maxLength = 80): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
