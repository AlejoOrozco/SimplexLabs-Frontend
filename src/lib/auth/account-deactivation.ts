/** Backend error code when a client account is disabled. */
export const ACCOUNT_DEACTIVATED_CODE = 'ACCOUNT_DEACTIVATED';

export const ACCOUNT_DEACTIVATED_EVENT = 'account-deactivated';

export interface AccountDeactivatedDetail {
  code?: string;
  message?: string;
  contact?: string;
}

export class AccountDeactivatedError extends Error {
  public readonly detail: AccountDeactivatedDetail;

  public constructor(detail: AccountDeactivatedDetail) {
    super(detail.message ?? 'Account deactivated');
    this.name = 'AccountDeactivatedError';
    this.detail = detail;
  }
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}

function readCode(obj: Record<string, unknown>): string | undefined {
  const c = obj.code;
  return typeof c === 'string' ? c : undefined;
}

/**
 * Parses API JSON bodies from fetch or axios for account deactivation (401).
 */
export function parseAccountDeactivatedPayload(body: unknown): AccountDeactivatedDetail | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const root = body as Record<string, unknown>;

  const nested =
    root.error && typeof root.error === 'object' && !Array.isArray(root.error)
      ? (root.error as Record<string, unknown>)
      : null;

  const code = readCode(root) ?? (nested ? readCode(nested) : undefined);
  if (code !== ACCOUNT_DEACTIVATED_CODE) return null;

  let message = readString(root, 'message') ?? (nested ? readString(nested, 'message') : undefined);
  if (!message && Array.isArray(root.message) && root.message.every((m) => typeof m === 'string')) {
    message = root.message.join(', ');
  }

  const contact =
    readString(root, 'contact') ?? (nested ? readString(nested, 'contact') : undefined);

  return { code: ACCOUNT_DEACTIVATED_CODE, message, contact };
}

export function notifyAccountDeactivated(detail: AccountDeactivatedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AccountDeactivatedDetail>(ACCOUNT_DEACTIVATED_EVENT, {
      detail: { ...detail, code: ACCOUNT_DEACTIVATED_CODE },
    }),
  );
}
