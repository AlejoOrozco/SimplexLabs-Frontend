'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import type { Message } from '@/lib/types';
import { SenderType } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface MessageThreadProps {
  messages: readonly Message[];
}

export function MessageThread({ messages }: MessageThreadProps): JSX.Element {
  if (messages.length === 0) {
    return <EmptyState title="No messages yet" />;
  }

  return (
    <ol className="flex flex-col gap-3">
      {messages.map((m) => {
        const isAgent = m.senderType === SenderType.AGENT;
        return (
          <li
            key={m.id}
            className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-md rounded-lg border px-3 py-2 text-sm',
                isAgent
                  ? 'border-border-focus bg-brand text-text-inverse shadow-brand'
                  : 'border-border-default bg-surface-raised text-text-primary',
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <p className={cn('mt-1 text-xs text-text-tertiary')}>{formatDateTime(m.sentAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
