import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// Follow the redirect chain: check if adding fromPath→toPath creates any cycle
async function wouldCreateLoop(from: string, to: string, excludeId?: string): Promise<boolean> {
  const visited = new Set<string>([from]);
  let current = to;
  for (let i = 0; i < 10; i++) {
    if (visited.has(current)) return true;
    visited.add(current);
    const next = await prisma.redirect.findFirst({
      where: { fromPath: current, isActive: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { toPath: true }
    });
    if (!next) break;
    current = next.toPath;
  }
  return false;
}

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
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
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
