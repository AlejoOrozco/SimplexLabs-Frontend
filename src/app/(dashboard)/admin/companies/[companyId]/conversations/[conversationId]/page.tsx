import Link from 'next/link';
import { adminCompanyWorkspaceHref } from '@/lib/admin/admin-company-workspace-href';
import { ReadOnlyConversationView } from '@/components/admin/client-detail/read-only-conversation-view';

interface AdminCompanyConversationPageProps {
  params: { companyId: string; conversationId: string };
}

export default function AdminCompanyConversationPage({
  params,
}: AdminCompanyConversationPageProps): JSX.Element {
  const { companyId, conversationId } = params;
  return (
    <div className="space-y-4">
      <Link
        href={adminCompanyWorkspaceHref(companyId, 'conversations')}
        className="text-sm text-text-brand hover:underline"
      >
        ← Back to conversations
      </Link>
      <ReadOnlyConversationView companyId={companyId} conversationId={conversationId} />
    </div>
  );
}
