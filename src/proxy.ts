import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'a_very_long_fallback_secret_key_that_is_at_least_32_characters';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
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
      await jose.jwtVerify(sessionToken, secretKey, {
        algorithms: ['HS256'],
      });
      isValidSession = true;
    } catch (e) {
      // Invalid token
    }
  }

  // Redirect logic
  if (isAuthPage) {
    if (isValidSession) {
      // If logged in, redirect away from login/register to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!isValidSession) {
    // If not logged in, redirect to login page
    const loginUrl = new URL('/login', request.url);
    // Keep search params if they want to redirect back
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config matching all paths except specific ones
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
