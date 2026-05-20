import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/shared/FormError';
import { cn } from '@/lib/utils/cn';

interface FormFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  description,
  error,
  children,
  className,
}: FormFieldProps): JSX.Element {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm text-text-primary">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </Label>
      {description ? <p className="text-xs text-text-secondary">{description}</p> : null}
      {children}
      <FormError message={error} />
    </div>
  );
}
