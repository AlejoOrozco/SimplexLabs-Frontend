/** Encode a company id for use in `/admin/companies/:companyId/...` paths. */
export function adminCompanyPath(companyId: string): string {
  return `/admin/companies/${encodeURIComponent(companyId)}`;
}

function toQueryRecord(
  params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean | undefined> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

export { toQueryRecord };
