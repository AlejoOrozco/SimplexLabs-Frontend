import { redirect } from 'next/navigation';

interface LegacyAdminCompanyWorkspacePathRedirectProps {
  params: { companyId: string };
  searchParams: Record<string, string | string[] | undefined>;
}

function searchParamsToQuery(
  searchParams: LegacyAdminCompanyWorkspacePathRedirectProps['searchParams'],
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        sp.append(key, v);
      }
    } else {
      sp.set(key, value);
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Legacy URL segment `/admin/clients/[companyId]` → company workspace under Companies. */
export default function LegacyAdminCompanyWorkspacePathRedirect({
  params,
  searchParams,
}: LegacyAdminCompanyWorkspacePathRedirectProps): never {
  redirect(`/admin/companies/${params.companyId}${searchParamsToQuery(searchParams)}`);
}
