import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

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
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, htmlContent, title, heading, isActive } = body;

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
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only admins can delete pages.' }, { status: 403 });
    }

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
