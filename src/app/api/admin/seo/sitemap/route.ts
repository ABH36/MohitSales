import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const overrides = await prisma.sitemapOverride.findMany({ orderBy: { urlPath: 'asc' } });
    return NextResponse.json({ success: true, data: overrides });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch sitemap overrides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { urlPath, priority, changeFreq, isExcluded } = body;
    if (!urlPath) return NextResponse.json({ success: false, error: 'urlPath required' }, { status: 400 });

    const override = await prisma.sitemapOverride.upsert({
      where: { urlPath },
      update: { priority: priority ?? 0.5, changeFreq: changeFreq || 'monthly', isExcluded: !!isExcluded },
      create: { urlPath, priority: priority ?? 0.5, changeFreq: changeFreq || 'monthly', isExcluded: !!isExcluded },
    });
    return NextResponse.json({ success: true, data: override });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save sitemap override' }, { status: 500 });
  }
}

