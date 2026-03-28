import { NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/album', '/diary', '/chat', '/calendar', '/games', '/settings'];

function isProtectedPath(pathname) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isOnboardingPath(pathname) {
  return pathname.startsWith('/onboarding');
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('countlove_session')?.value;
  const onboardingCompleted = request.cookies.get('countlove_onboarding_completed')?.value === 'true';

  if (isOnboardingPath(pathname)) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!onboardingCompleted) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*', '/album/:path*', '/diary/:path*', '/chat/:path*', '/calendar/:path*', '/games/:path*', '/settings/:path*'],
};
