function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export interface MeProfilePreview {
  name: string | null;
  email: string | null;
  companyId: string | null;
  companyName: string | null;
}

export function getMeProfilePreview(payload: unknown): MeProfilePreview {
  if (!payload || typeof payload !== 'object') {
    return { name: null, email: null, companyId: null, companyName: null };
  }

  const root = payload as Record<string, unknown>;
  const nestedUser =
    root.user && typeof root.user === 'object' ? (root.user as Record<string, unknown>) : null;
  const nestedCompany =
    root.company && typeof root.company === 'object'
      ? (root.company as Record<string, unknown>)
      : nestedUser?.company && typeof nestedUser.company === 'object'
        ? (nestedUser.company as Record<string, unknown>)
        : null;

  const firstName =
    readNonEmptyString(root.firstName) ??
    readNonEmptyString(root.first_name) ??
    readNonEmptyString(nestedUser?.firstName);
  const lastName =
    readNonEmptyString(root.lastName) ??
    readNonEmptyString(root.last_name) ??
    readNonEmptyString(nestedUser?.lastName);
  const name = firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName;

  return {
    name,
    email: readNonEmptyString(root.email) ?? readNonEmptyString(nestedUser?.email),
    companyId:
      readNonEmptyString(root.companyId) ??
      readNonEmptyString(root.company_id) ??
      readNonEmptyString(nestedUser?.companyId) ??
      readNonEmptyString(nestedUser?.company_id) ??
      readNonEmptyString(nestedCompany?.id),
    companyName: readNonEmptyString(nestedCompany?.name),
  };
}
