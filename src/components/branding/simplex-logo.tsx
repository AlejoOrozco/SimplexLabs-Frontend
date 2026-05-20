import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/** Served from `public/`; keep in sync with `media/logo/logoColor.webp`. */
const LOGO_PATH = '/logo-color.webp';

export interface SimplexLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
  /** When false, use empty alt (e.g. wordmark visible beside the mark). */
  decorative?: boolean;
}

export function SimplexLogo({
  size = 28,
  className,
  priority = false,
  decorative = false,
}: SimplexLogoProps): JSX.Element {
  return (
    <Image
      src={LOGO_PATH}
      alt={decorative ? '' : 'SimplexLabs'}
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      priority={priority}
    />
  );
}
