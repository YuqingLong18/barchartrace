import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  isTeacherSession,
  verifyAuthSession,
} from '@/lib/auth/constants';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/session', '/favicon.ico'];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/assets')
  );
}

function buildLoginUrl(request: NextRequest, error?: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';

  if (request.nextUrl.pathname !== '/login') {
    loginUrl.searchParams.set(
      'redirect',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
  }

  if (error) {
    loginUrl.searchParams.set('error', error);
  }

  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifyAuthSession(sessionToken);

    if (pathname === '/login' && isTeacherSession(session)) {
      const redirect = request.nextUrl.searchParams.get('redirect') || '/';
      const redirectUrl = new URL(redirect, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifyAuthSession(sessionToken);

  if (isTeacherSession(session)) {
    return NextResponse.next();
  }

  if (session?.role === 'student') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Teacher account required', code: 'teacher_only' },
        { status: 403 }
      );
    }

    return NextResponse.redirect(buildLoginUrl(request, 'teacher_only'));
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.redirect(buildLoginUrl(request));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
