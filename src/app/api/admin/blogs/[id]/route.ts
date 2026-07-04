import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { blogUpdateSchema } from '@/lib/schemas/blog';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, blogUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { slug, title, content, isPublished, excerpt, coverImage, categoryId, tags, metaTitle, metaDesc, isFeatured } = parsed.data;
    const authorId = auth.userId;

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
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

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
