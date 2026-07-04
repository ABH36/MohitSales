import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const { id } = await (params as any);
    const body = await request.json();
    const { page, schemaType, jsonLd, isActive } = body;
    if (jsonLd) { try { JSON.parse(jsonLd); } catch { return NextResponse.json({ success: false, error: 'Invalid JSON-LD' }, { status: 400 }); } }
    
    const existing = await prisma.schemaMarkup.findUnique({ where: { id }, select: { page: true } });
    
    const data: any = {};
    if (page !== undefined) data.page = page;
    if (schemaType !== undefined) data.schemaType = schemaType;
    if (jsonLd !== undefined) data.jsonLd = jsonLd;
    if (isActive !== undefined) data.isActive = !!isActive;

    const schema = await prisma.schemaMarkup.update({
      where: { id },
      data,
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
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const { id } = await (params as any);
    const existing = await prisma.schemaMarkup.findUnique({ where: { id }, select: { page: true } });
    await prisma.schemaMarkup.delete({ where: { id } });
    if (existing?.page) revalidatePath(existing.page);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Schema not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to delete schema' }, { status: 500 });
  }
}
