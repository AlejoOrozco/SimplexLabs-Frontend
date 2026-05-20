import { cn } from '@/lib/utils/cn';

export function sidebarFooterControlClass(isCollapsed: boolean, isActive: boolean): string {
  return cn(
    'group relative flex w-full items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors',
    isCollapsed ? 'justify-center' : 'gap-2.5',
    isActive
      ? 'border-l-brand-500 bg-brand-50 text-text-brand'
      : 'border-l-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary',
  );
}
