import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const path = new URL(request.url).searchParams.get('path') || '/';
    const found = await prisma.redirect.findFirst({
      where: { fromPath: path, isActive: true },
      select: { id: true, toPath: true, type: true },
    });
    if (found) {
      // Fire-and-forget hit count (don't block the response)
      prisma.redirect.update({
        where: { id: found.id },
        data: { hitCount: { increment: 1 } },
      }).catch(() => null);
      return NextResponse.json({ redirect: { toPath: found.toPath, type: found.type } });
    }
    return NextResponse.json({ redirect: null });
  } catch {
    return NextResponse.json({ redirect: null });
  }
}
