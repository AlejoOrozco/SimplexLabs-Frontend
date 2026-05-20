import { normalizePublicWebsiteUrl } from '@/lib/websites/normalize-public-website-url';

/**
 * Same-origin screenshot proxy. Avoids loading thum.io directly in the browser (403 / odd
 * error bodies) and supports optional signed thum.io requests server-side.
 */
export function buildWebsiteScreenshotSrc(
  rawTargetUrl: string,
  options: { width: number; crop: number },
): string {
  const targetUrl = normalizePublicWebsiteUrl(rawTargetUrl);
  const query = new URLSearchParams();
  query.set('url', targetUrl);
  query.set('width', String(options.width));
  query.set('crop', String(options.crop));
  return `/api/website-screenshot?${query.toString()}`;
}

export { normalizePublicWebsiteUrl } from '@/lib/websites/normalize-public-website-url';
