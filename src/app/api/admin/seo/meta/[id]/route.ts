import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await (params as any);
    const meta = await prisma.seoMeta.findUnique({ where: { id } });
    if (!meta) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: meta });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const { id } = await (params as any);
    const body = await request.json();
    const { title, description, keywords, ogImage, ogTitle, canonicalUrl, noIndex, noFollow } = body;
    
    // Fetch page path before update to revalidate the correct ISR cache
    const existing = await prisma.seoMeta.findUnique({ where: { id }, select: { page: true } });
    
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (keywords !== undefined) data.keywords = keywords;
    if (ogImage !== undefined) data.ogImage = ogImage;
    if (ogTitle !== undefined) data.ogTitle = ogTitle;
    if (canonicalUrl !== undefined) data.canonicalUrl = canonicalUrl;
    if (noIndex !== undefined) data.noIndex = !!noIndex;
    if (noFollow !== undefined) data.noFollow = !!noFollow;

    const meta = await prisma.seoMeta.update({
      where: { id },
      data,
    });
    if (existing?.page) revalidatePath(existing.page);
    return NextResponse.json({ success: true, data: meta });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Meta not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const { id } = await (params as any);
    const existing = await prisma.seoMeta.findUnique({ where: { id }, select: { page: true } });
    await prisma.seoMeta.delete({ where: { id } });
    if (existing?.page) revalidatePath(existing.page);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Meta not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
