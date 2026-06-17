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
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
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
