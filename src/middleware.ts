import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Strip potential spoofed headers from incoming client request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');

  const { pathname } = request.nextUrl;

  // Only protect /admin and /api/admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Exact path exclusions to prevent prefix bypass (e.g. /api/admin/author-settings)
  const excludedPaths = [
    '/admin/login',
    '/api/admin/auth/login',
    '/api/admin/auth/logout',
    '/api/admin/auth/me',
    '/api/admin/auth/verify-otp',
  ];

  if (excludedPaths.includes(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login if accessing an admin page without a token
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // Call /api/admin/auth/me to verify user state (isActive === true), token signature, and role in one DB query
    const authMeUrl = new URL('/api/admin/auth/me', request.url);
    const authResponse = await fetch(authMeUrl.toString(), {
      headers: {
        cookie: `${COOKIE_NAME}=${token}`,
      },
    });

    if (!authResponse.ok) {
      if (authResponse.status === 500) {
        console.error('[Middleware] Database down or internal auth error. Denying access (Fail Closed).');
      } else {
        console.warn(`[Middleware] Authentication check failed (status: ${authResponse.status}). Denying access.`);
      }
      throw new Error(`Auth API responded with status ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    if (!authData || !authData.success || !authData.user) {
      throw new Error('Invalid authentication response structure');
    }
    
    // Pass the user ID or role in headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', authData.user.id);
    requestHeaders.set('x-user-role', authData.user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Session validation failed in middleware:', error);
    
    // Clear the invalid cookie and redirect to login
    const response = pathname.startsWith('/api/') 
      ? NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', request.url));
      
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
