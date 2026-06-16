/**
 * Admin Logout API — POST /api/admin/auth/logout
 * ================================================
 * Clears the admin authentication cookie.
 */

import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '../../../../../lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out.' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env['SECURE_COOKIE'] !== 'false',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
