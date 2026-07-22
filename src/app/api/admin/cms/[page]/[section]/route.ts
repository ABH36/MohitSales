import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sanitizeHtml } from '@/lib/utils';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { cmsUpdateSchema } from '@/lib/schemas/cms';

interface RouteParams {
  params: { page: string; section: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const userRole = _request.headers.get('x-user-role');
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const validSlug = /^[a-z0-9][a-z0-9_-]{0,63}$/;
    if (!validSlug.test(params.page) || !validSlug.test(params.section)) {
      return NextResponse.json({ success: false, message: 'Invalid page or section slug.' }, { status: 400 });
    }

    const parsed = await parseBody(request, cmsUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { content, sortOrder, isActive } = parsed.data;

    let finalContent = content;
    if (params.section === 'promo_popup') {
      try {
        const config = typeof content === 'string' ? JSON.parse(content) : content;
        if (config && config.template === 'custom_html' && config.customHtml) {
          config.customHtml = sanitizeHtml(config.customHtml);
          finalContent = config;
        }
      } catch (err) {
        console.error('Failed to parse and sanitize promo popup customHtml:', err);
      }
    }

    const contentStr = typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent);

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
      // The company profile renders on About Us now; /company-profile is only a
      // redirect, so revalidating that path would refresh nothing.
      'company-profile': '/about-us',
    };
    const revalidateTarget = revalidateMap[params.page];
    if (revalidateTarget) revalidatePath(revalidateTarget);

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    console.error('[Admin CMS PUT]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
