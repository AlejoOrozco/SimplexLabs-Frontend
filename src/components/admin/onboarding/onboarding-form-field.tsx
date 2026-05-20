import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

interface OnboardingFormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function OnboardingFormField({
  label,
  required,
  children,
  className,
}: OnboardingFormFieldProps): JSX.Element {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm text-text-primary">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
