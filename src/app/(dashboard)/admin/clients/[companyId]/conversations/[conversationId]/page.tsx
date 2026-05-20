import { redirect } from 'next/navigation';
import { adminCompanyConversationHref } from '@/lib/admin/admin-company-workspace-href';

interface LegacyAdminCompanyConversationPathRedirectProps {
  params: { companyId: string; conversationId: string };
}

/** Legacy URL segment `/admin/clients/.../conversations/...` → Companies workspace conversation. */
export default function LegacyAdminCompanyConversationPathRedirect({
  params,
}: LegacyAdminCompanyConversationPathRedirectProps): never {
  redirect(adminCompanyConversationHref(params.companyId, params.conversationId));
}
