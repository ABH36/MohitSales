import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const data: { name?: string; slug?: string; description?: string | null; sortOrder?: number } = {};

    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
    if (typeof body.slug === 'string' && body.slug.trim()) {
      const slug = slugify(body.slug);
      const dup = await prisma.blogCategory.findFirst({ where: { slug, NOT: { id: params.id } } });
      if (dup) return NextResponse.json({ success: false, message: 'A category with this slug already exists.' }, { status: 409 });
      data.slug = slug;
    }
    if (body.description !== undefined) data.description = body.description || null;
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;

    const category = await prisma.blogCategory.update({ where: { id: params.id }, data });
    revalidatePath('/blog');
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    console.error('[Admin Blog Category PUT]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Admin-only destructive delete (matches the other sections). Posts in this
    // category are unlinked (categoryId -> null), not deleted.
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;

    await prisma.$transaction([
      prisma.blogPost.updateMany({ where: { categoryId: params.id }, data: { categoryId: null } }),
      prisma.blogCategory.delete({ where: { id: params.id } }),
    ]);

    revalidatePath('/blog');
    return NextResponse.json({ success: true, message: 'Category deleted.' });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    console.error('[Admin Blog Category DELETE]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
