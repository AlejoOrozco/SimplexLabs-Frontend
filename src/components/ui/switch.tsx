'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ id, checked, onCheckedChange, disabled, className }: SwitchProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onCheckedChange(!checked);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border border-border-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-text-primary' : 'bg-surface-overlay',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-surface-page shadow-sm ring-0 transition-transform',
          checked && 'translate-x-[1.375rem]',
        )}
        aria-hidden
      />
    </button>
  );
}
