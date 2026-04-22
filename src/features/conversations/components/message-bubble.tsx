import type { ConversationThreadMessage } from '@/features/conversations/types';

export function MessageBubble({ message }: { message: ConversationThreadMessage }): JSX.Element {
  const isContact = message.senderType === 'CONTACT';
  const bubbleClass = isContact ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white';

  return (
    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${bubbleClass} ${isContact ? 'self-start' : 'self-end'}`}>
      <p className="text-sm">{message.content}</p>
      <p className="mt-1 text-[10px] opacity-80">
        {new Date(message.sentAt).toLocaleTimeString()} {message.deliveredAt ? '✓' : ''}
      </p>
    </div>
  );
}
