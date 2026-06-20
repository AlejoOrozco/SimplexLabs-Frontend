import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/admin',
  '/dashboard',
  '/inbox',
  '/appointments',
  '/staff',
  '/orders',
  '/payments',
  '/notifications',
  '/settings',
  '/websites',
];

const LEGACY_ADMIN_REDIRECTS: Readonly<Record<string, string>> = {
  '/companies': '/admin/companies',
  '/failed-tasks': '/admin/failed-tasks',
  '/health': '/admin/health',
};

function legacyAdminRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;

  for (const [legacyPrefix, canonicalPrefix] of Object.entries(LEGACY_ADMIN_REDIRECTS)) {
    if (pathname === legacyPrefix || pathname.startsWith(`${legacyPrefix}/`)) {
      const suffix = pathname.slice(legacyPrefix.length);
      const destination = new URL(`${canonicalPrefix}${suffix}${search}`, request.url);
      return NextResponse.redirect(destination);
    }
  }

  return null;
}

export function middleware(request: NextRequest): NextResponse {
  const legacyRedirect = legacyAdminRedirect(request);
  if (legacyRedirect) return legacyRedirect;

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtectedRoute) return NextResponse.next();

  const hasAccessCookie = request.cookies.has('access_token');
  if (hasAccessCookie) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/inbox/:path*',
    '/appointments/:path*',
    '/staff/:path*',
    '/orders/:path*',
    '/payments/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/websites/:path*',
    '/companies/:path*',
    '/failed-tasks/:path*',
    '/health/:path*',
  ],
};
