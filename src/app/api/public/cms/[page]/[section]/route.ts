import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { page: string; section: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const record = await prisma.cmsSection.findUnique({
      where: { page_section: { page: params.page, section: params.section } },
    });

    if (!record || !record.isActive) {
      // Optional CMS content (e.g. homepage banners / promo popup) an admin hasn't
      // configured yet. Every consumer already treats a falsy response as "use the
      // built-in fallback", so return 200 with no data rather than a noisy 404.
      const res = NextResponse.json({ success: false, data: null, message: 'Not configured.' });
      res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res;
    }

    let parsed;
    try {
      parsed = JSON.parse(record.content);
    } catch {
      parsed = record.content;
    }

    const res = NextResponse.json({ success: true, data: { content: parsed } });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (error: any) {
    console.error('[Public CMS GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
