import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { wouldCreateLoop } from '@/lib/redirects';


export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: redirects });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch redirects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const { fromPath, toPath, type, isActive } = body;
    if (!fromPath || !toPath) return NextResponse.json({ success: false, error: 'fromPath and toPath required' }, { status: 400 });
    if (fromPath === toPath) return NextResponse.json({ success: false, error: 'fromPath and toPath cannot be the same' }, { status: 400 });

    if (!toPath.startsWith('/')) 
      return NextResponse.json({ success: false, error: 'toPath must be a relative path starting with /' }, { status: 400 });

    if (type !== undefined && ![301, 302, 307].includes(Number(type)))
      return NextResponse.json({ success: false, error: 'type must be 301, 302, or 307' }, { status: 400 });

    if (await wouldCreateLoop(fromPath, toPath)) {
      return NextResponse.json({ success: false, error: 'This would create a redirect loop' }, { status: 400 });
    }

    const redirect = await prisma.redirect.create({
      data: { fromPath, toPath, type: type || 301, isActive: isActive !== false },
    });
    revalidatePath(fromPath);
    return NextResponse.json({ success: true, data: redirect });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ success: false, error: 'fromPath already exists' }, { status: 409 });
    return NextResponse.json({ success: false, error: 'Failed to create redirect' }, { status: 500 });
  }
}
