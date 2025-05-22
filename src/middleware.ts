import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed'
});

const protectedRoutes = ['/profile', '/chat'];

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  const locale = pathname.split('/')[1];
  const pathnameWithoutLocale = locale && ['en', 'ru'].includes(locale) 
    ? pathname.substring(locale.length + 1) 
    : pathname;
    
  const isAuthRoute = pathnameWithoutLocale.startsWith('/auth');
  const isProtectedRoute = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    const profileUrl = new URL(`/${locale}/profile`, request.url);
    return NextResponse.redirect(profileUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 