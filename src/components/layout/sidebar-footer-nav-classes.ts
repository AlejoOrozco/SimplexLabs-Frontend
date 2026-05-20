import { cn } from '@/lib/utils/cn';

export function sidebarFooterControlClass(isCollapsed: boolean, isActive: boolean): string {
  return cn(
    'group relative flex items-center rounded-md border-l-2 px-3 py-2 text-sm transition-colors',
    isCollapsed ? 'justify-center' : 'gap-2.5',
    isActive
      ? 'border-l-brand bg-surface-raised text-text-brand shadow-brand'
      : 'border-l-transparent text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
  );
}
