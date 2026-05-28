import type { ConversationThreadMessage } from '@/features/conversations/types';

export function MessageBubble({ message }: { message: ConversationThreadMessage }): JSX.Element {
  const isContact = message.senderType === 'CONTACT';

  return (
    <div className={`flex ${isContact ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 ${
          isContact ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <p className="mt-1 text-[10px] opacity-80">
          {new Date(message.sentAt).toLocaleTimeString()}
          {!isContact && message.deliveredAt ? ' ✓' : ''}
        </p>
      </div>
    </div>
  );
}
