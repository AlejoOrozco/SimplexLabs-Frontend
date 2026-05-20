import { normalizePublicWebsiteUrl } from '@/lib/websites/normalize-public-website-url';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
]);

function isBlockedPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h.endsWith('.localhost')) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  return false;
}

/** Returns a normalized public http(s) URL or null if unsafe / invalid (SSRF guard). */
export function parsePublicHttpUrlForScreenshot(raw: string): URL | null {
  let candidate: URL;
  try {
    candidate = new URL(normalizePublicWebsiteUrl(raw.trim()));
  } catch {
    return null;
  }
  if (candidate.protocol !== 'https:' && candidate.protocol !== 'http:') return null;
  if (isBlockedPrivateHostname(candidate.hostname)) return null;
  return candidate;
}
