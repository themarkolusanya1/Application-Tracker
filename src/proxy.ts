import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { db } from './lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_long_fallback_secret_key_that_is_at_least_32_characters';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes (landing page, auth pages)
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  
  // Exclude static assets, API routes, or next internal files
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico';

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;

  let isValidSession = false;
  if (sessionToken) {
    try {
      const { payload } = await jose.jwtVerify(sessionToken, secretKey, {
        algorithms: ['HS256'],
      });
      const userId = (payload as any).userId;
      if (userId) {
        const userExists = await db.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (userExists) {
          isValidSession = true;
        }
      }
    } catch (e) {
      // Invalid token
    }
  }

  // Landing page: always public, but if logged in redirect to dashboard
  if (isLandingPage) {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Auth pages: if already logged in, redirect to dashboard
  if (isAuthPage) {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes (everything else: /dashboard, /jobs, /university, etc.)
  if (!isValidSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config matching all paths except specific ones
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
