import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

export async function GET() {
  try {
    const metas = await prisma.seoMeta.findMany({ orderBy: { page: 'asc' } });
    return NextResponse.json({ success: true, data: metas });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch SEO meta' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const { page, title, description, keywords, ogImage, ogTitle, canonicalUrl, noIndex, noFollow } = body;
    if (!page) return NextResponse.json({ success: false, error: 'page is required' }, { status: 400 });

    const meta = await prisma.seoMeta.upsert({
      where: { page },
      update: { title, description, keywords, ogImage, ogTitle, canonicalUrl, noIndex: !!noIndex, noFollow: !!noFollow },
      create: { page, title, description, keywords, ogImage, ogTitle, canonicalUrl, noIndex: !!noIndex, noFollow: !!noFollow },
    });
    revalidatePath(page);
    return NextResponse.json({ success: true, data: meta });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save SEO meta' }, { status: 500 });
  }
}
