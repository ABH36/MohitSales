import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Strip potential spoofed headers from incoming client request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');

  const { pathname } = request.nextUrl;

  // ── Public route redirect check ───────────────────────────────────────
  // Runs for all public pages (not admin, not api, not static assets).
  // Checks DB for active redirects; fails open so pages are never blocked.
  const isPublicPage =
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/assets') &&
    pathname !== '/favicon.ico';

  if (isPublicPage) {
    try {
      // Use request.nextUrl.origin to avoid hardcoded ports which break in deployment
      const redirectCheckUrl = new URL('/api/public/redirect', request.nextUrl.origin);
      redirectCheckUrl.searchParams.set('path', pathname);
      const redirectRes = await fetch(redirectCheckUrl.toString());
      if (redirectRes.ok) {
        const data = await redirectRes.json();
        if (data.redirect) {
          return NextResponse.redirect(
            new URL(data.redirect.toPath, request.url),
            { status: data.redirect.type }
          );
        }
      }
    } catch {
      // fail open — never block a public page due to redirect check failure
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Admin / API admin authentication ─────────────────────────────────
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
    // Directly verify the JWT in the Edge middleware (using jose library)
    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      throw new Error('Invalid or expired token');
    }
    
    // Pass the user ID or role in headers
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', (payload.role as string) || 'USER');

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
    // Admin auth protection
    '/admin/:path*',
    '/api/admin/:path*',
    // Public pages: DB redirect check (excludes static, _next, api routes)
    '/((?!_next/static|_next/image|favicon\\.ico|assets|api).*)',
  ],
};
