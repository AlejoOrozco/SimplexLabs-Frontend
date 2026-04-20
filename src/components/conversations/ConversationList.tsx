'use client';

import { DataTable, type DataTableColumn } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Conversation } from '@/lib/types';
import { channelLabel, formatRelative, fullName } from '@/lib/utils/format';

interface ConversationListProps {
  conversations: readonly Conversation[];
  onRowClick?: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  onRowClick,
}: ConversationListProps): JSX.Element {
  const columns: readonly DataTableColumn<Conversation>[] = [
    {
      id: 'contact',
      header: 'Contact',
      cell: (row) => (row.contact ? fullName(row.contact) : '—'),
    },
    { id: 'channel', header: 'Channel', cell: (row) => channelLabel(row.channel) },
    {
      id: 'lastMessage',
      header: 'Last message',
      cell: (row) =>
        row.lastMessage ? (
          <span className="line-clamp-1 max-w-sm text-gray-700">{row.lastMessage.content}</span>
        ) : (
          '—'
        ),
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      cell: (row) => formatRelative(row.updatedAt),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="conversation" status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={conversations}
      getRowId={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No conversations"
      emptyDescription="Conversations populate automatically from messaging webhooks."
    />
  );
}
