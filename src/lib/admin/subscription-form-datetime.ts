/** Convert a date input value (`YYYY-MM-DD`) to UTC ISO start-of-day. */
export function dateInputToIsoStart(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function defaultSubscriptionStartedDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Default initial payment when assigning a plan (setup fee preferred over monthly). */
export function defaultInitialPaymentForPlan(plan: {
  setupFee: number;
  priceMonthly: number;
}): number {
  if (plan.setupFee > 0) return plan.setupFee;
  return plan.priceMonthly;
}
