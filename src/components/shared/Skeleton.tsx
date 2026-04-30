import { cn } from '@/lib/utils/cn';

type SkeletonVariant = 'text' | 'circle' | 'rect';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: SkeletonVariant;
}

export function Skeleton({
  width,
  height,
  className,
  variant = 'rect',
}: SkeletonProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-block animate-[shimmer_1.2s_ease-in-out_infinite] bg-[linear-gradient(110deg,var(--surface-raised),var(--surface-overlay),var(--surface-raised))] bg-[length:200%_100%]',
        variant === 'circle' ? 'rounded-full' : 'rounded-md',
        variant === 'text' ? 'h-4 rounded-sm' : '',
        className,
      )}
      style={{ width, height }}
      aria-hidden
    />
  );
}

export function SkeletonText(): JSX.Element {
  return (
    <div className="space-y-2">
      <Skeleton variant="text" className="w-4/5" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-3/5" />
    </div>
  );
}

export function SkeletonCard(): JSX.Element {
  return (
    <div className="space-y-3 rounded-lg border border-border-default p-4">
      <Skeleton className="h-5 w-1/3" />
      <SkeletonText />
    </div>
  );
}

export function SkeletonTable(): JSX.Element {
  return (
    <div className="rounded-lg border border-border-default">
      <div className="grid grid-cols-4 gap-4 border-b border-border-default p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat(): JSX.Element {
  return (
    <div className="rounded-lg border border-border-default p-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-8 w-24" />
    </div>
  );
}
