import type { NextRequest } from 'next/server';
import {
  buildThumIoRefererStyleFetchUrl,
  buildThumIoSignedFetchUrl,
  buildThumIoUnsignedQueryFetchUrl,
} from '@/lib/websites/thum-io-signed-fetch-url';
import { parsePublicHttpUrlForScreenshot } from '@/lib/websites/parse-public-http-url-for-screenshot';
import { websiteScreenshotPlaceholderResponse } from '@/lib/websites/website-screenshot-placeholder-response';

/**
 * thum.io integration (server only):
 * - MD5 signed: `THUM_IO_KEY_ID` + `THUM_IO_SECRET`
 * - Referer-based key (no token in URL): set `THUM_IO_REFERER` to the exact site origin you
 *   registered with thum.io (e.g. `https://simplexa-labs.vercel.app/`). The proxy sends this as
 *   the `Referer` header when calling thum.io so any target URL can be screenshotted under your plan.
 */

export const runtime = 'nodejs';

const MIN_DIM = 40;
const MAX_DIM = 2400;

function clampDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), MIN_DIM), MAX_DIM);
}

export async function GET(req: NextRequest): Promise<Response> {
  if (!req.cookies.has('access_token')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl?.trim()) {
    return new Response('Missing url', { status: 400 });
  }

  const parsed = parsePublicHttpUrlForScreenshot(rawUrl);
  if (!parsed) {
    return new Response('Invalid or disallowed url', { status: 400 });
  }

  const targetUrl = parsed.toString();
  const width = clampDimension(Number(req.nextUrl.searchParams.get('width')), 1280);
  const crop = clampDimension(Number(req.nextUrl.searchParams.get('crop')), 720);

  const secret = process.env.THUM_IO_SECRET;
  const keyId = process.env.THUM_IO_KEY_ID?.trim();
  const refererAllowlist = process.env.THUM_IO_REFERER?.trim();
  const useSignedAuth = Boolean(secret && keyId);

  let upstreamUrl: string;
  if (secret && keyId) {
    upstreamUrl = buildThumIoSignedFetchUrl(targetUrl, { width, crop }, { keyId, secret });
  } else if (refererAllowlist) {
    upstreamUrl = buildThumIoRefererStyleFetchUrl(targetUrl, { width, crop });
  } else {
    upstreamUrl = buildThumIoUnsignedQueryFetchUrl(targetUrl, { width, crop });
  }

  const upstreamHeaders: Record<string, string> = {
    'User-Agent': 'Simplex-Website-Preview/1.0',
  };
  if (refererAllowlist && !useSignedAuth) {
    upstreamHeaders.Referer = refererAllowlist;
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: upstreamHeaders,
      next: { revalidate: 300 },
    });

    if (!upstream.ok) {
      return websiteScreenshotPlaceholderResponse();
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return websiteScreenshotPlaceholderResponse();
    }

    const body = upstream.body;
    if (!body) {
      const buf = await upstream.arrayBuffer();
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch {
    return websiteScreenshotPlaceholderResponse();
  }
}
