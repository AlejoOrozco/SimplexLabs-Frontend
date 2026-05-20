import { createHash } from 'node:crypto';

const THUM_IO_ORIGIN = 'https://image.thum.io';

/**
 * MD5 token for thum.io signed URLs (matches `thum.io` npm package / official JS client).
 * @see https://github.com/golmansax/thum.io-js/blob/master/src/index.ts
 */
export function thumIoMd5AuthToken(secret: string, expiresMs: number, targetPageUrl: string): string {
  return createHash('md5').update(`${secret}${expiresMs}${targetPageUrl}`).digest('hex');
}

/** Default 5 minute expiry window, matching thum.io-js. */
const DEFAULT_SKEW_MS = 300_000;

/**
 * Full https URL to fetch a thum.io screenshot with MD5 auth. Target page URL is appended
 * raw at the end of the path (thum.io convention).
 */
export function buildThumIoSignedFetchUrl(
  targetPageUrl: string,
  imageOpts: { width: number; crop: number },
  credentials: { keyId: string; secret: string },
  nowMs: number = Date.now(),
): string {
  const expires = nowMs + DEFAULT_SKEW_MS;
  const hash = thumIoMd5AuthToken(credentials.secret, expires, targetPageUrl);
  const { width, crop } = imageOpts;
  return `${THUM_IO_ORIGIN}/get/auth/${credentials.keyId}-${expires}-${hash}/width/${width}/crop/${crop}/${targetPageUrl}`;
}

/** Unsigned URL with target appended to the path (thum.io referer-key docs). */
export function buildThumIoRefererStyleFetchUrl(
  targetPageUrl: string,
  imageOpts: { width: number; crop: number },
): string {
  const { width, crop } = imageOpts;
  return `${THUM_IO_ORIGIN}/get/width/${width}/crop/${crop}/${targetPageUrl}`;
}

/** Unsigned fetch URL (query `url=`) — use when no referer allowlist is configured. */
export function buildThumIoUnsignedQueryFetchUrl(
  targetPageUrl: string,
  imageOpts: { width: number; crop: number },
): string {
  const { width, crop } = imageOpts;
  const query = new URLSearchParams();
  query.set('url', targetPageUrl);
  return `${THUM_IO_ORIGIN}/get/width/${width}/crop/${crop}/?${query.toString()}`;
}
