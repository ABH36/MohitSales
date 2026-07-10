import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { blogCreateSchema } from '@/lib/schemas/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { name: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Admin Blogs GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, blogCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { slug, title, content, isPublished, excerpt, coverImage, categoryId, tags, metaTitle, metaDesc, isFeatured } = parsed.data;
    const authorId = auth.userId;

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

    // Make it live immediately: the blog index, the post itself (if published),
    // and the layout (nav / featured widgets).
    revalidatePath('/blog');
    if (blog.isPublished) revalidatePath(`/blog/${blog.slug}`);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    console.error('[Admin Blogs POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Slug must be unique.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
