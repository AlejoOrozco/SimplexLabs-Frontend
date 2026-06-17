import { ApiClientError } from '@/lib/api/client';
import { AuthDeactivatedError } from '@/lib/auth/account-deactivation';

export function isAuthDeactivationError(error: unknown): boolean {
  if (error instanceof AuthDeactivatedError) return true;
  if (error instanceof ApiClientError) {
    return error.code === 'ACCOUNT_DEACTIVATED' || error.code === 'COMPANY_DEACTIVATED';
  }
  return false;
}
