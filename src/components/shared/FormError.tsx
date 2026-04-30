import { CircleX } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps): JSX.Element | null {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn(
        'flex items-center gap-1 text-xs text-error transition-all duration-base ease-out',
        className,
      )}
    >
      <CircleX className="h-3.5 w-3.5" />
      <span>{message}</span>
    </p>
  );
}
