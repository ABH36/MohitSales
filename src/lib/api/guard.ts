import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type AdminRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface UserContext {
  userId: string;
  role: AdminRole;
}

/**
 * Reads the authenticated admin context injected by `middleware.ts`.
 *
 * Middleware verifies the JWT and sets `x-user-id` / `x-user-role`, and it
 * strips any client-supplied copies of those headers beforehand — so the
 * values read here are trustworthy and don't need to be re-verified.
 */
export function getUserContext(request: NextRequest): UserContext | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role') as AdminRole | null;
  if (!userId || !role) return null;
  return { userId, role };
}

const unauthorized = () =>
  NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });

const forbidden = () =>
  NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });

/**
 * Guard for admin route handlers. Returns the user context when the caller
 * holds one of the allowed roles, otherwise a ready-to-return 401/403 response.
 *
 *   const auth = requireRole(request, ['ADMIN', 'EDITOR']);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.userId / auth.role are now available and typed
 */
export function requireRole(request: NextRequest, roles: AdminRole[]): UserContext | NextResponse {
  const ctx = getUserContext(request);
  if (!ctx) return unauthorized();
  if (!roles.includes(ctx.role)) return forbidden();
  return ctx;
}
