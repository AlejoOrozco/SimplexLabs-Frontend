import Link from 'next/link';
import type { ConversationListItem } from '@/features/conversations/types';

export function ConversationRow({ conversation }: { conversation: ConversationListItem }): JSX.Element {
  const contactName = `${conversation.contact.firstName} ${conversation.contact.lastName}`.trim();
  return (
    <Link
      href={`/inbox/${conversation.id}`}
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
