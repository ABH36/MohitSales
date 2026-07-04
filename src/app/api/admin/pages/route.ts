import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { pageCreateSchema } from '@/lib/schemas/page';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';

    const where: Prisma.PageContentWhereInput = {};
    if (search) {
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { heading: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.pageContent.findMany({
        where,
        select: { id: true, slug: true, legacyPath: true, title: true, heading: true, isActive: true, updatedAt: true },
        orderBy: { slug: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pageContent.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: pages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('[Admin Pages GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, pageCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { slug, htmlContent, title, heading } = parsed.data;

    const existing = await prisma.pageContent.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A page with this slug already exists.' }, { status: 409 });
    }

    const page = await prisma.pageContent.create({
      data: { slug, htmlContent, title: title || null, heading: heading || null, isActive: true }
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Pages POST]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
