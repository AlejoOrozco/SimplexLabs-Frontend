import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/inbox',
  '/appointments',
  '/staff',
  '/orders',
  '/payments',
  '/notifications',
  '/settings',
  '/failed-tasks',
  '/companies',
  '/health',
];

export function middleware(request: NextRequest): NextResponse {
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
    '/dashboard/:path*',
    '/inbox/:path*',
    '/appointments/:path*',
    '/staff/:path*',
    '/orders/:path*',
    '/payments/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/failed-tasks/:path*',
    '/companies/:path*',
    '/health/:path*',
  ],
};
