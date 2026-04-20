'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/conversations/ConversationList';
import { MessageThread } from '@/components/conversations/MessageThread';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConversations, useMessages } from '@/lib/hooks/use-conversations';
import { Channel, type Conversation } from '@/lib/types';
import { channelLabel } from '@/lib/utils/format';

type ChannelFilter = Channel | 'ALL';

const CHANNEL_OPTIONS: readonly ChannelFilter[] = [
  'ALL',
  Channel.WHATSAPP,
  Channel.INSTAGRAM,
  Channel.MESSENGER,
];

export default function ConversationsPage(): JSX.Element {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('ALL');
  const [selected, setSelected] = useState<Conversation | null>(null);

  const { data, isLoading, isError, error } = useConversations(
    channelFilter === 'ALL' ? undefined : channelFilter,
  );
  const messages = useMessages(selected?.id);

  return (
    <PageWrapper
      title="Conversations"
      description="Agent threads across all channels."
      actions={
        <div className="flex gap-1">
          {CHANNEL_OPTIONS.map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={channelFilter === c ? 'default' : 'secondary'}
              onClick={() => setChannelFilter(c)}
            >
              {c === 'ALL' ? 'All' : channelLabel(c)}
            </Button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-sm text-red-700">{error.message}</p>
      ) : (
        <ConversationList conversations={data ?? []} onRowClick={setSelected} />
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Conversation{' '}
              {selected?.contact
                ? `· ${selected.contact.firstName} ${selected.contact.lastName}`
                : null}
            </DialogTitle>
          </DialogHeader>
          {messages.isLoading ? (
            <LoadingSpinner />
          ) : messages.isError ? (
            <p className="text-sm text-red-700">{messages.error.message}</p>
          ) : (
            <MessageThread messages={messages.data ?? []} />
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
