import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { wouldCreateLoop } from '@/lib/redirects';


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const { fromPath, toPath, type, isActive } = body;

    if (toPath !== undefined && !toPath.startsWith('/')) 
      return NextResponse.json({ success: false, error: 'toPath must be a relative path starting with /' }, { status: 400 });

    if (type !== undefined && ![301, 302, 307].includes(Number(type)))
      return NextResponse.json({ success: false, error: 'type must be 301, 302, or 307' }, { status: 400 });

    const existing = await prisma.redirect.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });

    const effectiveFrom = fromPath !== undefined ? fromPath : existing.fromPath;
    const effectiveTo = toPath !== undefined ? toPath : existing.toPath;

    if (effectiveFrom && effectiveTo) {
      if (effectiveFrom === effectiveTo) {
        return NextResponse.json({ success: false, error: 'fromPath and toPath cannot be the same' }, { status: 400 });
      }

      if (await wouldCreateLoop(effectiveFrom, effectiveTo, params.id)) {
        return NextResponse.json({ success: false, error: 'This would create a redirect loop' }, { status: 400 });
      }
    }

    const redirect = await prisma.redirect.update({
      where: { id: params.id },
      data: { fromPath, toPath, type, isActive },
    });
    const affectedPath = fromPath || existing?.fromPath;
    if (affectedPath) revalidatePath(affectedPath);
    return NextResponse.json({ success: true, data: redirect });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to update redirect' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const existing = await prisma.redirect.findUnique({ where: { id: params.id }, select: { fromPath: true } });
    await prisma.redirect.delete({ where: { id: params.id } });
    if (existing?.fromPath) revalidatePath(existing.fromPath);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ success: false, error: 'Redirect not found' }, { status: 404 });
    return NextResponse.json({ success: false, error: 'Failed to delete redirect' }, { status: 500 });
  }
}
