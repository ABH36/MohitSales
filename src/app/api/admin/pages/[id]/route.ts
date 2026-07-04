import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { pageUpdateSchema } from '@/lib/schemas/page';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const page = await prisma.pageContent.findUnique({ where: { id: params.id } });
    if (!page) {
      return NextResponse.json({ success: false, message: 'Page not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('[Admin Pages GET ID]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, pageUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { slug, htmlContent, title, heading, isActive } = parsed.data;

    const existing = await prisma.pageContent.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Page not found.' }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.pageContent.findUnique({ where: { slug } });
      if (duplicate) {
        return NextResponse.json({ success: false, message: 'A page with this slug already exists.' }, { status: 409 });
      }
    }

    const updated = await prisma.pageContent.update({
      where: { id: params.id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(htmlContent !== undefined && { htmlContent }),
        ...(title !== undefined && { title }),
        ...(heading !== undefined && { heading }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    revalidatePath(`/${updated.slug}`);
    if (existing.slug !== updated.slug) {
      revalidatePath(`/${existing.slug}`);
    }

    return NextResponse.json({ success: true, data: { id: updated.id, slug: updated.slug, title: updated.title, heading: updated.heading, isActive: updated.isActive, updatedAt: updated.updatedAt } });
  } catch (error: any) {
    console.error('[Admin Pages PUT]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const existing = await prisma.pageContent.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Page not found.' }, { status: 404 });
    }

    await prisma.pageContent.delete({ where: { id: params.id } });
    revalidatePath(`/${existing.slug}`);

    return NextResponse.json({ success: true, message: 'Page deleted.' });
  } catch (error: any) {
    console.error('[Admin Pages DELETE]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
