'use client';

import { User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProfileAvatarProps {
  size?: number;
  className?: string;
}

export function SidebarProfileAvatar({ size = 32, className }: SidebarProfileAvatarProps): JSX.Element {
  const iconSize = Math.round(size * 0.5);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-raised text-text-secondary',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <User size={iconSize} strokeWidth={1.75} />
    </span>
  );
}
