import Link from 'next/link';
import type { ConversationListItem } from '@/features/conversations/types';

interface ConversationRowProps {
  conversation: ConversationListItem;
  /** When set, links to this URL instead of the default client inbox thread. */
  threadHref?: string;
}

export function ConversationRow({ conversation, threadHref }: ConversationRowProps): JSX.Element {
  const contactName = `${conversation.contact.firstName} ${conversation.contact.lastName}`.trim();
  const href = threadHref ?? `/inbox/${conversation.id}`;
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"
    >
      <div>
        <p className="font-medium">{contactName || 'Unknown contact'}</p>
        <p className="text-xs text-slate-500">
          {conversation.channel} · {conversation.lifecycleStatus}
        </p>
      </div>
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{conversation.controlMode}</span>
    </Link>
  );
}
