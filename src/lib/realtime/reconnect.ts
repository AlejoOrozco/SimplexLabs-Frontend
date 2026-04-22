export function shouldShowReconnectPill(disconnectedAt: number | null): boolean {
  if (disconnectedAt === null) return false;
  return Date.now() - disconnectedAt > 3_000;
}
