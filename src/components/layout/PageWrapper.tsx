import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageWrapperProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}: PageWrapperProps): JSX.Element {
  return (
    <section className={cn('space-y-6 p-6', className)}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description ? <p className="text-sm text-gray-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
