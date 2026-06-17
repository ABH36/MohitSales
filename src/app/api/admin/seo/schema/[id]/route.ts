import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { page, schemaType, jsonLd, isActive } = body;
    if (jsonLd) { try { JSON.parse(jsonLd); } catch { return NextResponse.json({ success: false, error: 'Invalid JSON-LD' }, { status: 400 }); } }
    const existing = await prisma.schemaMarkup.findUnique({ where: { id: params.id }, select: { page: true } });
    const schema = await prisma.schemaMarkup.update({
      where: { id: params.id },
      data: { ...(page && { page }), schemaType, jsonLd, isActive },
    });
    const affectedPage = page || existing?.page;
    if (affectedPage) revalidatePath(affectedPage);
    return NextResponse.json({ success: true, data: schema });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Schema not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to update schema' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const existing = await prisma.schemaMarkup.findUnique({ where: { id: params.id }, select: { page: true } });
    await prisma.schemaMarkup.delete({ where: { id: params.id } });
    if (existing?.page) revalidatePath(existing.page);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Schema not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to delete schema' }, { status: 500 });
  }
}
