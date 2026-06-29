import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { path, referrer } = body;

    if (!path) {
      return NextResponse.json({ success: false, error: 'Path is required' }, { status: 400 });
    }

    // Normalize path: trim spaces and remove query strings or hash parameters
    path = path.trim().split(/[?#]/)[0];

    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Skip logging for Next.js internal paths or static assets
    if (
      path.startsWith('/_next') ||
      path.startsWith('/assets') ||
      path.startsWith('/favicon.ico') ||
      path === '' ||
      path === '/'
    ) {
      return NextResponse.json({ success: true, message: 'Ignored internal path' });
    }

    // Check if an active redirect already exists for this path.
    // If a redirect is active, the middleware or pages will redirect the user, 
    // so we shouldn't clutter the 404 log with paths that are already handled.
    const activeRedirect = await prisma.redirect.findFirst({
      where: {
        fromPath: path,
        isActive: true,
      },
    });

    if (activeRedirect) {
      return NextResponse.json({ success: true, message: 'Redirect active for this path' });
    }

    // Clean and truncate referrer if needed
    const cleanReferrer = referrer ? String(referrer).trim().substring(0, 500) : null;

    // Upsert 404 log entry
    const log = await prisma.notFoundLog.upsert({
      where: { path },
      create: {
        path,
        referrer: cleanReferrer,
        hitCount: 1,
      },
      update: {
        hitCount: { increment: 1 },
        referrer: cleanReferrer || undefined, // Keep existing referrer if none provided
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    console.error('[Public 404 Log POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to record 404 log' }, { status: 500 });
  }
}
