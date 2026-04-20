import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback'] as const;
const AUTH_ROUTES = ['/login', '/register'] as const;
const PROTECTED_PREFIX = '/dashboard';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

function hasSessionCookie(req: NextRequest): boolean {
  return (
    Boolean(req.cookies.get(ACCESS_TOKEN_COOKIE)?.value) ||
    Boolean(req.cookies.get(REFRESH_TOKEN_COOKIE)?.value)
  );
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const hasSession = hasSessionCookie(req);

  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r);
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r);

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!isPublic && !isProtected) {
    // Let Next.js handle unknown routes (404).
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next assets)
     * - favicon, public files (anything with a file extension)
     * - api routes (Next API, not backend — none in this app currently)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
