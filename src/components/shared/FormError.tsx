import { cn } from '@/lib/utils/cn';

interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps): JSX.Element | null {
  if (!message) return null;
  return (
    <p role="alert" className={cn('text-sm text-red-600', className)}>
      {message}
    </p>
  );
}
