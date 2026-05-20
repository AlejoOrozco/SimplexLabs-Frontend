import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-border-default bg-surface-raised text-text-primary',
        success: 'border-success/40 bg-success-surface text-success',
        warning: 'border-warning/40 bg-warning-surface text-warning',
        destructive: 'border-error/40 bg-error-surface text-error',
        info: 'border-border-website bg-info-surface text-text-website',
        neutral: 'border-border-default bg-surface-overlay text-text-secondary',
        agents: 'border-border-agents bg-[var(--color-agents-surface)] text-text-agents',
        website: 'border-border-website bg-[var(--color-website-surface)] text-text-website',
        marketing: 'border-border-marketing bg-[var(--color-marketing-surface)] text-text-marketing',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
