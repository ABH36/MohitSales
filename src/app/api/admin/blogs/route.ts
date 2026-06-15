import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { name: true } }
      }
    });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('[Admin Blogs GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, content, isPublished, excerpt, coverImage, categoryId, tags, metaTitle, metaDesc, isFeatured } = body;
    const authorId = request.headers.get('x-user-id');

    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, message: 'Slug, title, and content are required' }, { status: 400 });
    }

    const blog = await prisma.blogPost.create({
      data: {
        slug,
        title,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        tags: tags || null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        isFeatured: isFeatured ?? false,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        ...(authorId && { authorId }),
      },
    });

    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    console.error('[Admin Blogs POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Slug must be unique.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
