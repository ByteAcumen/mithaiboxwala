import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CUSTOMER_COOKIE_NAME = 'mb_session';
const ADMIN_COOKIE_NAME = 'mb_admin_session';

function getSafeInternalPath(value: string | null, fallback: string): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // Create response
  let response = NextResponse.next();

  // Add request tracing header
  response.headers.set('X-Request-Id', requestId);

  // 1. Protect Customer Account Pages: /account/*
  if (pathname.startsWith('/account')) {
    const sessionCookie = request.cookies.get(CUSTOMER_COOKIE_NAME);
    if (!sessionCookie?.value) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Admin Dashboard Pages: /admin/* (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!adminCookie?.value) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 3. Prevent authenticated users from getting stuck on login page
  if (pathname === '/auth/login' && request.cookies.get(CUSTOMER_COOKIE_NAME)?.value) {
    const returnUrl = getSafeInternalPath(request.nextUrl.searchParams.get('returnUrl'), '/account');
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  if (pathname === '/admin/login' && request.cookies.get(ADMIN_COOKIE_NAME)?.value) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons).*)',
  ],
};
