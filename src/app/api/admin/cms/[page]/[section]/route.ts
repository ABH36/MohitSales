import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: { page: string; section: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const record = await prisma.cmsSection.findUnique({
      where: { page_section: { page: params.page, section: params.section } },
    });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    console.error('[Admin CMS GET section]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const validSlug = /^[a-z0-9][a-z0-9_-]{0,63}$/;
    if (!validSlug.test(params.page) || !validSlug.test(params.section)) {
      return NextResponse.json({ success: false, message: 'Invalid page or section slug.' }, { status: 400 });
    }

    const body = await request.json();
    const { content, sortOrder, isActive } = body;

    if (content === undefined) {
      return NextResponse.json({ success: false, message: 'content is required.' }, { status: 400 });
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    if (contentStr.length > 500_000) {
      return NextResponse.json({ success: false, message: 'Content too large (max 500KB).' }, { status: 400 });
    }

    const record = await prisma.cmsSection.upsert({
      where: { page_section: { page: params.page, section: params.section } },
      create: {
        page: params.page,
        section: params.section,
        content: contentStr,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
      update: {
        content: contentStr,
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    const revalidateMap: Record<string, string> = {
      'homepage': '/',
      'about-us': '/about-us',
      'company-profile': '/company-profile',
    };
    const revalidateTarget = revalidateMap[params.page];
    if (revalidateTarget) revalidatePath(revalidateTarget);

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    console.error('[Admin CMS PUT]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
