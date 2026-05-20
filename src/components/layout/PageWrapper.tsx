'use client';

import type { ReactNode } from 'react';
import { PageMeta } from '@/components/layout/page-meta';
import { cn } from '@/lib/utils/cn';

interface PageWrapperProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** @deprecated Prefer PageMeta for shell header title/description and render actions inline. */
export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}: PageWrapperProps): JSX.Element {
  return (
    <section className={cn('space-y-6', className)}>
      <PageMeta title={title} description={description} />
      {actions ? <div className="flex items-center justify-end gap-2">{actions}</div> : null}
      <div>{children}</div>
    </section>
  );
}
