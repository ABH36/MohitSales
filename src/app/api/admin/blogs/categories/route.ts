import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('[Admin Blog Categories GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required.' }, { status: 400 });
    }
    const slug = slugify(typeof body.slug === 'string' && body.slug ? body.slug : name);
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Could not derive a valid slug from the name.' }, { status: 400 });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A category with this slug already exists.' }, { status: 409 });
    }

    const category = await prisma.blogCategory.create({
      data: {
        slug,
        name,
        description: body.description || null,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      },
    });

    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('[Admin Blog Categories POST]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
