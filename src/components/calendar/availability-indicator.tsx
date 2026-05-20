'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { AvailabilityResult } from '@/lib/types/calendar';

interface AvailabilityIndicatorProps {
  availability: AvailabilityResult | undefined;
  isLoading: boolean;
}

export function AvailabilityIndicator({
  availability,
  isLoading,
}: AvailabilityIndicatorProps): JSX.Element | null {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Checking availability…
      </div>
    );
  }

  if (!availability) return null;

  if (availability.available) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] p-3 text-sm text-[var(--color-success-dark)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        This time slot is available
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-error-dark)]">
        <XCircle className="h-4 w-4 shrink-0" aria-hidden />
        This slot is not available
      </div>
      {!availability.withinWorkingHours && availability.workingHoursReason ? (
        <p className="text-xs text-[var(--color-error-dark)]">{availability.workingHoursReason}</p>
      ) : null}
      {availability.conflicts.map((c) => (
        <p key={c.id} className="text-xs text-[var(--color-error-dark)]">
          Conflicts with: {c.title}
        </p>
      ))}
    </div>
  );
}
