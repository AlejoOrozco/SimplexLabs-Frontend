/**
 * Bootstrap `/auth/me` can still be inside the axios 401 → `/auth/refresh` retry path
 * when password login completes. If that stale refresh fails, the client interceptor
 * calls `onAuthFailure` and would clear a brand-new session unless we ignore that burst.
 *
 * Separately, the axios interceptor emits `session:expired` when `/me` is still 401 after
 * refresh returns 200 (anonymous browser / half-cleared cookies). The session coordinator
 * must not treat that as a real expiry on public auth routes — it would call `logout()`,
 * hit `/auth/logout` with no session (401), and race successful `login()`.
 */
let suppressAuthFailureCallsUntilMs = 0;

const ANONYMOUS_SESSION_PATH_PREFIXES = [
  '/login',
  '/register',
  '/oauth',
  '/auth/callback',
  '/forbidden',
] as const;

export function armAuthFailureSuppression(durationMs: number = 2000): void {
  suppressAuthFailureCallsUntilMs = Date.now() + durationMs;
}

export function shouldSuppressAuthFailureCall(): boolean {
  return Date.now() < suppressAuthFailureCallsUntilMs;
}

/** True when `session:expired` should not run logout + toast (bootstrap noise or post-login). */
export function shouldIgnoreSpuriousSessionExpiredLogout(): boolean {
  if (typeof window === 'undefined') return false;
  if (shouldSuppressAuthFailureCall()) return true;
  const path = window.location.pathname;
  return ANONYMOUS_SESSION_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
