import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, content, isPublished, excerpt, coverImage, categoryId, tags, metaTitle, metaDesc, isFeatured } = body;
    const authorId = request.headers.get('x-user-id');

    // Fetch existing blog to prevent publishedAt from resetting
    const existing = await prisma.blogPost.findUnique({
      where: { id: params.id },
      select: { isPublished: true, publishedAt: true }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const blog = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        content: content !== undefined ? content : undefined,
        excerpt: excerpt !== undefined ? excerpt : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
        tags: tags !== undefined ? tags : undefined,
        metaTitle: metaTitle !== undefined ? metaTitle : undefined,
        metaDesc: metaDesc !== undefined ? metaDesc : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        ...(isPublished !== undefined && {
          isPublished,
          publishedAt: isPublished === true
            ? (existing.isPublished ? existing.publishedAt : new Date())
            : null,
        }),
        ...(authorId && { authorId }),
      },
    });

    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    console.error('[Admin Blogs PUT]', error);
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ success: false, message: 'Slug must be unique.' }, { status: 400 });
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const blog = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { slug: true } });
    await prisma.blogPost.delete({ where: { id: params.id } });
    if (blog?.slug) revalidatePath(`/blog/${blog.slug}`);
    revalidatePath('/blog');
    return NextResponse.json({ success: true, message: 'Blog deleted.' });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
