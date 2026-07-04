import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

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
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
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

