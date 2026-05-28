import Link from 'next/link';
import type { ConversationListItem } from '@/features/conversations/types';
import {
  getContactDisplayName,
  getConversationChannelLabel,
  getConversationStatusLabel,
  truncatePreview,
} from '@/features/conversations/utils/conversation-display';
import { convoStatusLabel } from '@/lib/utils/format';

interface ConversationRowProps {
  conversation: ConversationListItem;
  /** When set, links to this URL instead of the default client inbox thread. */
  threadHref?: string;
}

export function ConversationRow({ conversation, threadHref }: ConversationRowProps): JSX.Element {
  const contactName = getContactDisplayName(conversation);
  const href = threadHref ?? `/inbox/${conversation.id}`;
  const preview = conversation.lastMessage?.content
    ? truncatePreview(conversation.lastMessage.content)
    : 'No messages yet';
  const timeSource = conversation.lastMessage?.sentAt ?? conversation.updatedAt;
  const timeLabel = new Date(timeSource).toLocaleString();
  const statusKey = conversation.status ?? null;
  const statusLabel = statusKey
    ? convoStatusLabel(statusKey)
    : getConversationStatusLabel(conversation);

  return (
    <Link
      href={href}
      className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{contactName}</p>
          {conversation.unreadCount > 0 ? (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-slate-600">{preview}</p>
        <p className="mt-1 text-xs text-slate-500">
          {getConversationChannelLabel(conversation.channel)} · {statusLabel}
        </p>
      </div>
      <time className="shrink-0 text-xs text-slate-500" dateTime={timeSource}>
        {timeLabel}
      </time>
    </Link>
  );
}
