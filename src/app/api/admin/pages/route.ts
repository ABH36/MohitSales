import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';

    const where: any = {};
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
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, htmlContent, title, heading } = body;

    if (!slug || !htmlContent) {
      return NextResponse.json({ success: false, message: 'Slug and HTML content are required.' }, { status: 400 });
    }

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
