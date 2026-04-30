'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface PageShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

function titleFromSegment(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getBreadcrumbs(pathname: string): Array<{ href: string; label: string }> {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join('/')}`,
    label: titleFromSegment(segment),
  }));
}

export function PageShell({ title, description, children, className }: PageShellProps): JSX.Element {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const fallbackTitle = breadcrumbs.at(-1)?.label ?? 'Dashboard';
  const resolvedTitle = title ?? fallbackTitle;

  return (
    <section className={cn('flex h-full min-h-0 flex-col', className)}>
      <header className="border-b border-border-default px-8 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-text-secondary">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="inline-flex items-center gap-2">
              {index > 0 ? <span>/</span> : null}
              <span>{crumb.label}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-semibold text-text-primary">{resolvedTitle}</h1>
        {description ? <p className="mt-2 text-sm text-text-secondary">{description}</p> : null}
      </header>
      <div className="min-h-0 flex-1 px-8 py-6">{children}</div>
    </section>
  );
}
