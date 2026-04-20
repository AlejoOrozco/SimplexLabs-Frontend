import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  className,
  label = 'Loading…',
  fullScreen = false,
}: LoadingSpinnerProps): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-gray-600',
        fullScreen ? 'min-h-screen w-full' : 'w-full py-8',
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
