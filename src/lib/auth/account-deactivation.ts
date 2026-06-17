/** Backend error code when a client account is disabled. */
export const ACCOUNT_DEACTIVATED_CODE = 'ACCOUNT_DEACTIVATED';

/** Backend error code when the user's company tenant is disabled. */
export const COMPANY_DEACTIVATED_CODE = 'COMPANY_DEACTIVATED';

export const AUTH_DEACTIVATED_EVENT = 'auth-deactivated';

export type AuthDeactivationKind = 'account' | 'company';

export interface AuthDeactivatedDetail {
  code: typeof ACCOUNT_DEACTIVATED_CODE | typeof COMPANY_DEACTIVATED_CODE;
  kind: AuthDeactivationKind;
  message?: string;
  contact?: string;
}

export class AuthDeactivatedError extends Error {
  public readonly detail: AuthDeactivatedDetail;

  public constructor(detail: AuthDeactivatedDetail) {
    super(detail.message ?? defaultMessageForKind(detail.kind));
    this.name = 'AuthDeactivatedError';
    this.detail = detail;
  }
}

function defaultMessageForKind(kind: AuthDeactivationKind): string {
  if (kind === 'company') return 'Company deactivated';
  return 'Account deactivated';
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}

function normalizeAuthErrorCode(code: string | undefined): AuthDeactivatedDetail['code'] | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase().replace(/-/g, '_');
  if (normalized === ACCOUNT_DEACTIVATED_CODE) return ACCOUNT_DEACTIVATED_CODE;
  if (normalized === COMPANY_DEACTIVATED_CODE) return COMPANY_DEACTIVATED_CODE;
  return null;
}

function readCode(obj: Record<string, unknown>): string | undefined {
  const c = obj.code;
  return typeof c === 'string' ? c : undefined;
}

function detailFromCode(
  code: AuthDeactivatedDetail['code'],
  message?: string,
  contact?: string,
): AuthDeactivatedDetail {
  const kind: AuthDeactivationKind = code === COMPANY_DEACTIVATED_CODE ? 'company' : 'account';
  return { code, kind, message, contact };
}

/**
 * Parses API JSON bodies from fetch or axios for account/company deactivation (401).
 */
export function parseAuthDeactivatedPayload(body: unknown): AuthDeactivatedDetail | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;

  const nested =
    root.error && typeof root.error === 'object' && !Array.isArray(root.error)
      ? (root.error as Record<string, unknown>)
      : null;

  const rawCode = readCode(root) ?? (nested ? readCode(nested) : undefined);
  const code = normalizeAuthErrorCode(rawCode);
  if (!code) return null;

  let message = readString(root, 'message') ?? (nested ? readString(nested, 'message') : undefined);
  if (!message && Array.isArray(root.message) && root.message.every((m) => typeof m === 'string')) {
    message = root.message.join(', ');
  }

  const contact =
    readString(root, 'contact') ?? (nested ? readString(nested, 'contact') : undefined);

  return detailFromCode(code, message, contact);
}

export function notifyAuthDeactivated(detail: AuthDeactivatedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AuthDeactivatedDetail>(AUTH_DEACTIVATED_EVENT, {
      detail,
    }),
  );
}
