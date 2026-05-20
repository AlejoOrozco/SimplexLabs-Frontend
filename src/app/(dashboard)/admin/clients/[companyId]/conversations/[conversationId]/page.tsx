import Link from 'next/link';
import { ReadOnlyConversationView } from '@/components/admin/client-detail/read-only-conversation-view';

interface AdminClientConversationPageProps {
  params: { companyId: string; conversationId: string };
}

export default function AdminClientConversationPage({
  params,
}: AdminClientConversationPageProps): JSX.Element {
  const { companyId, conversationId } = params;
  return (
    <div className="space-y-4">
      <Link
        href={`/admin/clients/${companyId}?tab=conversations`}
        className="text-sm text-text-brand hover:underline"
      >
        ← Back to conversations
      </Link>
      <ReadOnlyConversationView companyId={companyId} conversationId={conversationId} />
    </div>
  );
}
